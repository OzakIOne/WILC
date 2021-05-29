import fetch from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';
import pkg from 'node-html-parser';
const { parse } = pkg;

const URL_OPTIONS = {
  verID: '',
  sessionID: uuidv4(),
  prodID: '',
};

const BASE_URL = `https://www.microsoft.com/fr-fr/software-download/windows10ISO`;

const getSelectorAll = async (url, selector) =>
  await fetch(url)
    .then((res) => res.text())
    .then((body) => parse(body).querySelectorAll(selector));

const getWindowsLangID = (langList, windowsLang) =>
  langList.filter((lang, index) => {
    if (index !== 0)
      return JSON.parse(lang.getAttribute('value')).language === windowsLang;
  });

const generateIsoLink = async (windowsLang) => {
  const windowsList = await getSelectorAll(BASE_URL, 'option');
  URL_OPTIONS.verID = windowsList[1].getAttribute('value');
  const URL_LANG = `https://www.microsoft.com/en-us/api/controls/contentinclude/html?pageId=a8f8f489-4c7f-463a-9ca6-5cff94d8d041&host=www.microsoft.com&segments=software-download%2cwindows10ISO&query=&action=getskuinformationbyproductedition&sessionId=${URL_OPTIONS.sessionID}&productEditionId=${URL_OPTIONS.verID}&sdVersion=2`;
  const langList = await getSelectorAll(URL_LANG, 'option');
  const lang = getWindowsLangID(langList, windowsLang);
  URL_OPTIONS.prodID = JSON.parse(lang[0].getAttribute('value')).id;
  const URL_ISO = `https://www.microsoft.com/en-us/api/controls/contentinclude/html?pageId=a224afab-2097-4dfa-a2ba-463eb191a285&host=www.microsoft.com&segments=software-download%2cwindows10ISO&query=&action=GetProductDownloadLinksBySku&sessionId=${URL_OPTIONS.sessionID}&skuId=${URL_OPTIONS.prodID}&language=French&sdVersion=2`;
  const isoLinks = await getSelectorAll(URL_ISO, 'a');
  return [isoLinks[1].getAttribute('href'), isoLinks[2].getAttribute('href')];
};

generateIsoLink('English').then((e) => console.log(e));
