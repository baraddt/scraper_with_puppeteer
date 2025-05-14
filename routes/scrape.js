const express = require('express');
const router = express.Router();
const { scrapeAndUpdate } = require('../services/scraper');

router.post('/', async (req, res) => {
    try {
        const { mode, filePath, sheetName } = req.body;

        const result = await scrapeAndUpdate(mode, filePath, sheetName);

        res.status(200).json({ message: 'Success', data: result });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed', error: err.message });
    }
});

module.exports = router;