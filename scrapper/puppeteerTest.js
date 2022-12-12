const puppeteer = require("puppeteer");
const fs = require("fs/promises");
const { Parser } = require("json2csv");

const urlSearchResults =
  "https://publicaccess.glasgow.gov.uk/online-applications/simpleSearchResults.do?action=firstPage";
const urlSearchPage =
  "https://publicaccess.glasgow.gov.uk/online-applications/search.do?action=simple&searchType=Application";

const getSiteData = async (url) => {
  console.log("->START");
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);

  // SCREENSHOT THE PAGE
  const timeStamp = +new Date();
  console.log("TIME:", timeStamp);
  await page.screenshot({
    path: `../screenshots/start-pages/startPages${timeStamp}.png`,
  });

  // FILL THE SEARCH FORM AND GET SEARCH RESULTS
  try {
    // -- filling simple search form
    await page.type("#simpleSearchString", "listed demolition");
    await Promise.all([
      page.click(
        "#simpleSearchForm > div.row3 > input.button.primary.recaptcha-submit"
      ),
      // -- navigate to search results page
      page.waitForNavigation(),
    ]);
    const timeStamp2 = +new Date();
    console.log("Search TIME:", timeStamp2);
    await page.screenshot({
      path: `../screenshots/search-pages/searchResults${timeStamp2}.png`,
    });
  } catch (error) {
    console.error("Time out error. Try again after sometime");
  }

  // CREATING THE LIST OF URL OF SEARCH RESULT PAGES

  // -- get search page URL template and number of search results
  let { sPageLinkTemp, searchResultsCount } = await page.evaluate(() => {
    const sPageLinkTemp = document.querySelector(".top .page").href.split("&");

    const searchResultsCount = parseInt(
      document
        .querySelector("#searchResultsContainer > p.pager.top > span.showing")
        .innerText.trim()
        .split(" ")
        .pop()
    );

    return { sPageLinkTemp, searchResultsCount };
  });
  const urlFist = sPageLinkTemp[0];
  const urlSecond = sPageLinkTemp[1].split("=")[0];
  let loopIteration = Math.ceil(searchResultsCount / 10);
  let i = 1;
  let searchPageLinks = [];
  while (i <= loopIteration) {
    searchPageLinks.push(`${urlFist}&${urlSecond}=${i}`);
    i++;
  }
  console.log("--TEST:", searchPageLinks, searchResultsCount);

  // MAIN!!: SCRAPPING DATA
  let finalData = [];
  for (const searchPageLink of searchPageLinks) {
    // -- navigate to search result page
    await page.goto(searchPageLink);

    // -- get list of application links
    const appLinks = await page.evaluate(() => {
      const linkElementsList = document.querySelectorAll(".searchresult");
      let linksList = [];
      linkElementsList.forEach((link) => {
        linksList.push(link.querySelector("a").href);
      });

      return linksList;
    });
    // GETTING DATA FROM APPLICATIONS
    let data = [];
    for (const appLink of appLinks) {
      // -- navigate to application
      await page.goto(appLink);

      // -- get data from table
      const row = await page.evaluate(() => {
        const rowElements = document.querySelectorAll(
          "#simpleDetailsTable  tbody  tr"
        );

        let rowData = {};
        rowElements.forEach((el) => {
          const elData = el.querySelector("td").innerText.trim();
          const elHeader = el.querySelector("th").innerText.trim();
          rowData[elHeader] = elData;
        });

        return rowData;
      });

      data.push(row);
    }
    finalData.push(...data);
    console.log("->PROGRESS DATA:", finalData.length);
  }
  await browser.close();
  console.log(`->SCRAPPING COMPLETED at ${+new Date()}!!`);

  // CREATE CSV FILE
  convertToCVS(finalData);
};

const convertToCVS = async (jsonObj) => {
  console.log(`->Writing CVS`);
  const parserObj = new Parser();
  const csv = parserObj.parse(jsonObj);

  await fs.writeFile(`../csv-files/date${+new Date()}.csv`, csv);
  console.log(`->CVS WRITTEN & SAVED ${+new Date()}`);
};

getSiteData(urlSearchPage);
