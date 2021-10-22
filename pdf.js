'use strict';

// [START gae_std_headless_chrome_full_sample]
const express = require('express');
const puppeteer = require('puppeteer');
const { launchBrowser } = require('./helpers/browser');
const app = express();

async function main() {
  const browser = await launchBrowser(puppeteer);

  app.use(async (req, res) => {
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

  const server = app.listen(process.env.PORT || 8888, err => {
    if (err) {
      return console.error(err);
    }
    const {port} = server.address();
    console.info(`App listening on port ${port}`);
  });
}

main();

module.exports = app;
