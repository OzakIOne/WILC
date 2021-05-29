import puppeteer from 'puppeteer';

const iPhone = puppeteer.devices['iPhone 6'];

const pptrOptions = {
  headless: true,
  args: [
    '--no-service-autorun',
    '--no-experiments',
    '--no-default-browser-check',
    '--disable-extensions',
  ],
};

const getBrowserInstance = async (options) => puppeteer.launch(options);

async function generateIsoLink(browser, lang) {
  const BASE_URL = `https://www.microsoft.com/fr-fr/software-download/windows10ISO`;
  const page = await browser.newPage();
  await page.emulate(iPhone);
  await page.goto(BASE_URL);
  await page.$eval('#product-edition', (e) => (e.value = e.options[1].value));
  await page.$eval('#submit-product-edition', (e) => e.click());
  await page.waitForSelector('#product-languages', { timeout: 0 });
  await page.$eval(
    '#product-languages',
    (e, desiredLang) =>
      (e.value = [...e.options].filter((lang, index) => {
        if (index !== 0) return JSON.parse(lang.value).language === desiredLang;
      })[0].value),
    lang,
  );
  await page.waitForSelector('#submit-sku', { timeout: 0 });
  await page.$eval('#submit-sku', (e) => e.click());
  await page.waitForSelector('#card-info-content > div', { timeout: 0 });
  const isoLinks = await page.$$eval('#card-info-content > div > div', (e) =>
    e.map((el) => el.querySelector('a').href),
  );
  await browser.close();
  return isoLinks;
}

getBrowserInstance(pptrOptions).then((browser) => {
  const lang = 'English';
  generateIsoLink(browser, lang).then((e) => console.log(e));
});
