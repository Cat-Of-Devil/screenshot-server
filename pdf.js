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
      '--start-maximized', 
      //'--user-data-dir=$HOME/.config/google-chrome/',
      '--remote-debugging-port=9224'
    ],
    //executablePath:"/opt/google/chrome/google-chrome",
    //userDataDir: "/home/rmasyagin/.config/google-chrome/"
  });
  // [END gae_std_headless_chrome_full_sample_browser]

  app.use(async (req, res) => {
    const {url} = req.query;

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
    
    const pdfBuffer = await page.pdf({
      printBackground: true,
      // width:1920,
      // height:1080,
      //format: 'A4',
      // format: 'Letter', 
      // PreferCSSPageSize: true 
    });

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
  // [END gae_std_headless_chrome_full_sample]
}

main();

module.exports = app;
