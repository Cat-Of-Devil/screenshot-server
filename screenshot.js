'use strict';

const express = require('express');
const puppeteer = require('puppeteer');
const { launchBrowser } = require('./helpers/browser');

const app = express();

async function main() {
  const browser = await launchBrowser(puppeteer);

  app.use(async (req, res) => {
    const { url, format } = req.query;

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
    const type = format && ['png', 'jpg'].indexOf(format) !== -1 ? format : 'png';

    res.set('Content-Type', `image/${type}`);
    res.send(imageBuffer);
  });

  const server = app.listen(process.env.PORT || 7777, err => {
    if (err) {
      return console.error(err);
    }
    const {port} = server.address();
    console.info(`App listening on port ${port}`);
  });
}

main();

module.exports = app;
