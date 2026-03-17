const express = require('express');
const puppeteer = require('puppeteer');

const app = express();

app.use(express.json({ limit: '20mb' }));

app.get('/', (req, res) => {
  res.send('PDF service is working');
});

app.post('/generate-pdf', async (req, res) => {
  const { html } = req.body;

  if (!html) {
    return res.status(400).send('Brak pola "html" w body requestu');
  }

  let browser;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();

    await page.setContent(html, {
      waitUntil: 'networkidle0'
    });

    await page.emulateMediaType('screen');

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="generated.pdf"');

    res.send(pdf);
  } catch (error) {
    console.error('Blad generowania PDF:', error);
    res.status(500).send('Nie udalo sie wygenerowac PDF');
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`PDF service listening on port ${PORT}`);
});
