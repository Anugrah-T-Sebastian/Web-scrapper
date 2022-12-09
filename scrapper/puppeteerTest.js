const puppeteer = require("puppeteer");

const urlSearchResults =
  "https://publicaccess.glasgow.gov.uk/online-applications/simpleSearchResults.do?action=firstPage";
const urlSearchPage =
  "https://publicaccess.glasgow.gov.uk/online-applications/search.do?action=simple&searchType=Application";

const start = async (url) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);
  const timeStamp = +new Date();
  console.log("TIME:", timeStamp);
  await page.screenshot({
    path: `../screenshots/start-pages/startPages${timeStamp}.png`,
  });

  //console.log(references);
  //   const searchField = await page.evaluate(() => {
  //     const testEl = document.querySelector(".row3");
  //     return testEl.innerHTML;
  //   });

  await page.type("#simpleSearchString", "listed demolition");
  //   await page.click(
  //     "#simpleSearchForm > div.row3 > input.button.primary.recaptcha-submit"
  //   );
  //   page.waitForNavigation();
  await Promise.all([
    page.click(
      "#simpleSearchForm > div.row3 > input.button.primary.recaptcha-submit"
    ),
    page.waitForNavigation(),
  ]);
  const timeStamp2 = +new Date();
  console.log("Search TIME:", timeStamp2);
  await page.screenshot({
    path: `../screenshots/search-pages/searchResults${timeStamp2}.png`,
  });

  //console.log(test);

  await browser.close();
};

start(urlSearchPage);
