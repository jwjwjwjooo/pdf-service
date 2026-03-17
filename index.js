const express = require('express');
const puppeteer = require('puppeteer');

const app = express();

app.use(express.json({ limit: '20mb' }));

app.get('/', (req, res) => {
  res.send('PDF service is working');
});

app.post('/generate-pdf', async (req, res) => {
  const { html } = req.body;

  console.log('HTML length:', html?.length);

  if (!html) {
    return res.status(400).send('Brak HTML');
  }

  let browser;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    await page.setContent(html, {
      waitUntil: 'domcontentloaded'
    });

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', pdf.length);
    res.end(pdf);

  } catch (err) {
    console.error('PDF ERROR:', err);
    res.status(500).send(err.message);
  } finally {
    if (browser) await browser.close();
  }
});

app.listen(process.env.PORT || 3000);
