const express = require('express');
const puppeteer = require('puppeteer');

const app = express();

app.use(express.json({ limit: '20mb' }));

app.get('/', (req, res) => {
  res.send('PDF service is working');
});

app.post('/generate-pdf', async (req, res) => {
  const { html } = req.body;

  console.log('Request received');
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

    console.log('Browser launched');

    const page = await browser.newPage();

    await page.setContent(html, {
      waitUntil: 'networkidle0'
    });

    console.log('Content loaded');

    await page.emulateMediaType('screen');

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true
    });

    console.log('PDF generated, size:', pdf.length);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', pdf.length);
    res.setHeader('Content-Disposition', 'attachment; filename="generated.pdf"');

    res.end(pdf);

  } catch (err) {
    console.error('PDF ERROR:', err);
    res.status(500).send(err.message);
  } finally {
    if (browser) {
      await browser.close();
      console.log('Browser closed');
    }
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Server running');
});
