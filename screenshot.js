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
      //'--user-data-dir=$HOME/.config/google-chrome/',
      '--remote-debugging-port=9223'
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
