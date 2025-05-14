const express = require('express');
const cors = require('cors');
const scrapeRouter = require('./routes/scrape');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/scrape', scrapeRouter);

module.exports = app;
