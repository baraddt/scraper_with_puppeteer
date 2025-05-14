const ExcelJS = require('exceljs');
const xlsx = require('xlsx');
const { GoogleSpreadSheet } = require('google-spreadsheet');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

const scrapeAndUpdate = async (mode, filePath, sheetName, spreadsheetId, credentials) => {
    if (mode === 'excel') {
        await scrapeFromExcel(filePath, sheetName);
        return 'Scraping Excel success';
    } else if (mode === 'spreadsheet') {
        await scrapeFromSpreadSheet(spreadsheetId, credentials);
        return 'Scraping Spreadsheet success';
    } else {
        throw new Error('Mode tidak valid');
    }
};


const scrapeFromExcel = async (filePath, sheetName) => {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.getWorksheet(sheetName);

    // Header
    worksheet.getRow(1).getCell(1).value = 'Link Produk';
    worksheet.getRow(1).getCell(2).value = 'Harga';
    worksheet.getRow(1).getCell(3).value = 'Masa Aktif';
    worksheet.getRow(1).getCell(4).value = 'Kuota';

    let currentRow = 2;

    for (let i = 2; i <= worksheet.rowCount; i++) {
        const link = worksheet.getRow(i).getCell(1).value;
        if (!link || typeof link !== 'string' || !link.startsWith('http')) continue;

        const info = await scrapeProduct(link);
        if (!info) continue;

        // Split hasil scrape jika multiline
        const prices = info.price?.split('\n') || ['-'];
        const periods = info.activePeriod?.split('\n') || ['-'];
        const quotas = info.quota?.split('\n') || ['-'];

        const rowCount = Math.max(prices.length, periods.length, quotas.length);

        for (let j = 0; j < rowCount; j++) {
            const row = worksheet.getRow(currentRow + j);
            row.getCell(1).value = j === 0 ? link : ''; // link hanya di baris pertama
            row.getCell(2).value = prices[j] || '-';
            row.getCell(3).value = periods[j] || '-';
            row.getCell(4).value = quotas[j] || '-';
        }

        currentRow += rowCount + 1; 
    }

    applyStyling(worksheet);
    await workbook.xlsx.writeFile(filePath);
};


const scrapeFromSpreadSheet = async (spreadsheetId, credentials) => {
    const doc = new GoogleSpreadSheet(spreadsheetId);
    await doc.useServiceAccountAuth(credentials);
    await doc.loadInfo();

    const sheet = doc.sheetsByIndex[0];
    const rows = await sheet.getRows();

    for (const row of rows) {
        const link = row._rawData[0];
        if (!link) continue;

        const info = await scrapeProduct(link);
        if (info) {
            row._rawData[1] = info.price || '-';
            row._rawData[2] = info.activePeriod || '-';
            row._rawData[3] = info.quota || '-';
            await row.save();
        }
    }
};

const scrapeProduct = async (url) => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

        const data = await page.evaluate(() => {
            const getText = (selector) => {
                const el = document.querySelector(selector);
                return el ? el.innerText.trim() : null;
            };

            return {
                price: Array.from(document.querySelectorAll('.css-1vtq0aq')).map(el => el.innerText.trim()).join('\n'),
                activePeriod: Array.from(document.querySelectorAll('.css-hayuji')).map(el => el.innerText.trim()).join('\n'),
                quota: Array.from(document.querySelectorAll('.css-1y1bj62')).map(el => el.innerText.trim()).join('\n')
            };
        });

        await browser.close();
        return data;
    } catch (error) {
        console.error('Scraping failed for', url, error.message);
        await browser.close();
        return null;
    }
};

const applyStyling = (worksheet) => {
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF2196F3' }
        };
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    worksheet.eachRow((row) => {
        row.eachCell((cell) => {
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });
    });

    worksheet.columns.forEach((col) => {
        let maxLength = 0;
        col.eachCell({ includeEmpty: true }, (cell) => {
            const len = cell.value ? cell.value.toString().length : 10;
            if (len > maxLength) maxLength = len;
        });
        col.width = maxLength < 10 ? 10 : maxLength + 5;
    });
};

module.exports = { scrapeAndUpdate };
