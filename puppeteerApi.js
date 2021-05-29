import puppeteer from 'puppeteer';
import { v4 as uuidv4 } from 'uuid';

const pptrOptions = {
  headless: true,
  args: [
    '--no-service-autorun',
    '--no-experiments',
    '--no-default-browser-check',
    '--disable-extensions',
  ],
};

const URL_OPTIONS = {
  verID: '',
  sessionID: uuidv4(),
  prodID: '',
};

const getBrowserInstance = async (options) => puppeteer.launch(options);

async function generateIsoLink(browser, desiredLang) {
  const BASE_URL = `https://www.microsoft.com/fr-fr/software-download/windows10ISO`;
  const page = await browser.newPage();
  await page.setJavaScriptEnabled(false);
  await page.goto(BASE_URL);
  URL_OPTIONS.verID = await page.$$eval('option', (e) => e[1].value);

  const URL_LANG = `https://www.microsoft.com/en-us/api/controls/contentinclude/html?pageId=a8f8f489-4c7f-463a-9ca6-5cff94d8d041&host=www.microsoft.com&segments=software-download%2cwindows10ISO&query=&action=getskuinformationbyproductedition&sessionId=${URL_OPTIONS.sessionID}&productEditionId=${URL_OPTIONS.verID}&sdVersion=2`;
  await page.goto(URL_LANG);
  URL_OPTIONS.prodID = await page.$$eval(
    'option',
    (e, desiredLang) => {
      const langID = [...e].filter((lang, index) => {
        if (index !== 0) return JSON.parse(lang.value).language === desiredLang;
      });
      return JSON.parse(langID[0].value).id;
    },
    desiredLang,
  );
  const URL_ISO = `https://www.microsoft.com/en-us/api/controls/contentinclude/html?pageId=a224afab-2097-4dfa-a2ba-463eb191a285&host=www.microsoft.com&segments=software-download%2cwindows10ISO&query=&action=GetProductDownloadLinksBySku&sessionId=${URL_OPTIONS.sessionID}&skuId=${URL_OPTIONS.prodID}&language=French&sdVersion=2`;

  await page.goto(URL_ISO);
  const isoLinks = await page.$$eval('a', (e) => [e[1].href, e[2].href]);
  await browser.close();
  return isoLinks;
}

getBrowserInstance(pptrOptions).then((browser) => {
  const lang = 'English';
  generateIsoLink(browser, lang).then((e) => console.log(e));
});
