const express = require('express');
const puppeteer = require('puppeteer-core');

const app = express();

app.use(express.json({ limit: '20mb' }));

app.post('/generate-pdf', async (req, res) => {
  const { html } = req.body;

  let browser;

  try {
    browser = await puppeteer.launch({
      executablePath: process.env.CHROME_PATH || '/usr/bin/chromium-browser',
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    });

    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.send(pdf);

  } catch (e) {
    console.error(e);
    res.status(500).send('PDF error');
  } finally {
    if (browser) await browser.close();
  }
});

app.listen(process.env.PORT || 3000);
