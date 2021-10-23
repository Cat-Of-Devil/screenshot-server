'use strict';

const process = require('process');

process.on('beforeExit', (code) => {
  console.log('Process beforeExit event with code: ', code);
});

process.on('exit', (code) => {
  console.log('Process exit event with code: ', code);
});

// const { cpuUsage, memoryUsage } = process;
// console.log('cpuUsage', cpuUsage());
// console.log('memoryUsage', memoryUsage());

const express = require('express');
// const puppeteer = require('puppeteer');
const puppeteer = require('puppeteer-extra');
const { launchBrowser, blockDomains } = require('./helpers/browser');

const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

const app = express();

async function main() {
  app.get('/', async (req, res) => {
    const { url, format } = req.query;

    if (!url) {
      return res.send(`
        <p>Please provide URL as GET parameter, for example: <a href="/?url=https://example.com">?url=https://example.com</a></p>
        <p></p>Bookmarklet: <a href="javascript:open('http://localhost:7777?url='+location.href)">Screenshot</a></p>
      `);
    }

    console.log('url: ', url);

    const browser = await launchBrowser(puppeteer);
    const page = await browser.newPage();
    page.setViewport({width:1920, height:1080});
   
    await page.goto(url);
    const imageBuffer = await page.screenshot({fullPage: true});
    const type = format && ['png', 'jpg'].indexOf(format) !== -1 ? format : 'png';
    await page.close();
    
    res.set('Content-Type', `image/${type}`);
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

    const browser = await launchBrowser(puppeteer);
    const page = await browser.newPage();
    
    await page.goto(url);
    await page.emulateMedia('screen');
    page.setViewport({width:1920, height:1080});

    let pdfOptions = {
      printBackground: true,
      // width:1920,
      // height:1080,
      // format: 'A4',
      // format: 'Letter', 
      // PreferCSSPageSize: true 
    };

    if (fullpage == 'true') {
      pdfOptions.width = 1920;
      pdfOptions.height = 1080;
    }

    const pdfBuffer = await page.pdf(pdfOptions);
    page.close();

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
}

main();

module.exports = app;
