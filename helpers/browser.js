
let _browser = null;

const minArgs = [
  '--autoplay-policy=user-gesture-required',
  '--disable-background-networking',
  '--disable-background-timer-throttling',
  '--disable-backgrounding-occluded-windows',
  '--disable-breakpad',
  '--disable-client-side-phishing-detection',
  '--disable-component-update',
  '--disable-default-apps',
  '--disable-dev-shm-usage',
  '--disable-domain-reliability',
  '--disable-extensions',
  '--disable-features=AudioServiceOutOfProcess',
  '--disable-hang-monitor',
  '--disable-ipc-flooding-protection',
  '--disable-notifications',
  '--disable-offer-store-unmasked-wallet-cards',
  '--disable-popup-blocking',
  '--disable-print-preview',
  '--disable-prompt-on-repost',
  '--disable-renderer-backgrounding',
  '--disable-setuid-sandbox',
  '--disable-speech-api',
  '--disable-sync',
  '--hide-scrollbars',
  '--ignore-gpu-blacklist',
  '--metrics-recording-only',
  '--mute-audio',
  '--no-default-browser-check',
  '--no-first-run',
  '--no-pings',
  '--no-sandbox',
  '--no-zygote',
  '--password-store=basic',
  '--use-gl=swiftshader',
  '--use-mock-keychain',
];

const defaultConfig = {
  headless: true,
  args: [
    ...minArgs,
    '--no-sandbox', 
    '--disable-gpu',
    '--start-maximized', 
    '--disable-setuid-sandbox',
    '--remote-debugging-port=9223',
    '--hide-scrollbars',
    '--mute-audio',
    //'--user-data-dir=$HOME/.config/google-chrome/',
  ],
  //executablePath: "/usr/bin/chromium-browser",
  //executablePath:"/opt/google/chrome/google-chrome",
  //userDataDir: "/home/rmasyagin/.config/google-chrome/"
}

const DELAY_BEFORE_CLOSE = 60000;

let _timer = null;

const resetBrowserCloseTimer = (delay = DELAY_BEFORE_CLOSE) => {
  if (_timer) clearTimeout(_timer);
  _timer = setTimeout(() => {
    closeBrowser();
    _timer = null;
  }, delay)
}

const launchBrowser = async (
  puppeteer,
  config = defaultConfig,
  autoClose = true,
  delayBeforeClose = DELAY_BEFORE_CLOSE
) => {
  if (autoClose) {
    resetBrowserCloseTimer(delayBeforeClose);
  }
  if (!_browser) {
    _browser = await puppeteer.launch(config);
  }
  return _browser;
}

const closeBrowser = async () => {
  if (_browser !== null) {
    await _browser.close();
    _browser = null;
  }
}

const blackListDefault = [
  'googlesyndication.com',
  'adservice.google.com',
];

const blockDomains = async (page, blackList = blackListDefault) => {
  await page.setRequestInterception(true);
  page.on('request', request => {
    const url = request.url()
    if (blackList.some(domain => url.includes(domain))) {
      request.abort();
    } else {
      request.continue();
    }
  });
}

module.exports = {
  launchBrowser,
  closeBrowser,
  blockDomains,
}