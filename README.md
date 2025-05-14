🧠 Web Scraping with Puppeteer

Project ini menggunakan Puppeteer untuk melakukan web scraping secara otomatis. Tujuannya adalah untuk mengambil data dari halaman web dan memprosesnya sesuai kebutuhan.

---

📌 Catatan

- Puppeteer adalah library Node.js yang mengontrol browser Chrome secara headless (tanpa UI). untuk scraping data dari website yang membutuhkan rendering JavaScript.
- Pastikan lu punya Chrome atau Chromium yang terinstal dengan benar di environment lu, karena Puppeteer bakal ngeluncurin browser tersebut.

---

## 📊 How to Use Application

1. **Buat folder `data` di dalam project**:
   - Di dalam root folder project, buat folder baru dengan nama `data/`.

2. **Buat file Excel yang berisi link produk dari platform**:
   - Kumpulkan data link produk yang ingin di-scrape.
   - Simpan data tersebut ke dalam file Excel (misalnya `produk.xlsx`) menggunakan library seperti `xlsx` atau alat lainnya.

3. **Simpan file Excel di dalam folder `data/`**:
   - Pastikan file Excel yang sudah dibuat disimpan di dalam folder `data/` dengan nama file, misalnya `produk.xlsx`.

4. **Cek dan jalankan request menggunakan Postman atau aplikasi HTTP lainnya**:
   - Kirimkan request dengan body JSON seperti ini:

   ```json
   {
       "mode": "excel",
       "filePath": "./data/produk.xlsx",
       "sheetName": "Sheet1"
   }
