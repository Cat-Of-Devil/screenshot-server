'use strict';

// [START gae_std_headless_chrome_full_sample]
const express = require('express');
const puppeteer = require('puppeteer');
const app = express();

async function main() {
  // [START gae_std_headless_chrome_full_sample_browser]
  const browser = await puppeteer.launch({
    args: [
      '--no-sandbox', 
      '--disable-gpu',
      '--start-maximized', 
      '--disable-setuid-sandbox',
      '--remote-debugging-port=9223'
    ],
  });

  app.get('/', async (req, res) => {
    const {url} = req.query;

    if (!url) {
      return res.send(`
        <p>Please provide URL as GET parameter, for example: <a href="/?url=https://example.com">?url=https://example.com</a></p>
        <p></p>Bookmarklet: <a href="javascript:open('http://localhost:7777?url='+location.href)">Screenshot</a></p>
      `);
    }

    const page = await browser.newPage();
    await page.goto(url);

    page.setViewport({width:1920, height:1080});
    const imageBuffer = await page.screenshot({fullPage: true});

    res.set('Content-Type', 'image/png');
    res.send(imageBuffer);
  });

  app.get('/pdf', async (req, res) => {
    const {url, fullpage} = req.query;

    if (!url) {
      return res.send(`
        <p>Please provide URL as GET parameter, for example: <a href="/?url=https://example.com">?url=https://example.com</a></p>
        <p></p>Bookmarklet: <a href="javascript:open('http://localhost:8888?url='+location.href)">Pdf</a></p>
      `);
    }

    const page = await browser.newPage();
    await page.goto(url);
    await page.emulateMedia('screen');
    page.setViewport({width:1920, height:1080});

    let pdfOptions = {
      printBackground: true,
      // width:1920,
      // height:1080,
      //format: 'A4',
      // format: 'Letter', 
      // PreferCSSPageSize: true 
    };

    if (fullpage == 'true') {
      pdfOptions.width = 1920;
      pdfOptions.height = 1080;
    }

    const pdfBuffer = await page.pdf(pdfOptions);

    let hostName = url.replace(/(https?:\/\/(?:www\.)?([^\/]*)\/.*$)/,'$2');

    res.set('Content-Type', 'application/pdf');
    res.set('Content-Disposition', 'inline; filename="'+hostName+'.pdf"');
    res.send(pdfBuffer);
  });

  const server = app.listen(process.env.PORT || 7777, err => {
    if (err) {
      return console.error(err);
    }
    const {port} = server.address();
    console.info(`App listening on port ${port}`);
  });
  // [END gae_std_headless_chrome_full_sample]
}

main();

module.exports = app;
