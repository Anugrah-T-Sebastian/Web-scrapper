const puppeteer = require("puppeteer");
const fs = require("fs/promises");
const { Parser } = require("json2csv");

// IMPORT COUNCILS
const { councils } = require("../councils");

const getSiteData = async (councilURL, councilName) => {
  console.log("->START");
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(councilURL);

  // SCREENSHOT THE PAGE
  const timeStamp = +new Date();
  console.log("TIME:", timeStamp);
  // -- try creating the start-pages folder
  try {
    await fs.mkdir("../screenshots/start-pages");
  } catch (error) {
    console.error("-->Start-pagesFolder exists");
  }
  // -- try saving screenshot
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
    console.log("-->Search TIME:", timeStamp2);
    // -- create search-pages folder
    try {
      await fs.mkdir("../screenshots/search-pages");
    } catch (error) {
      console.error("-->Search-pages Folder exists");
    }
    // -- try saving screenshot
    await page.screenshot({
      path: `../screenshots/search-pages/searchResults${timeStamp2}.png`,
    });
  } catch (error) {
    console.error("-->Time out error. Try again after sometime");
  }

  let flag = 0;
  // CREATING THE LIST OF URL OF SEARCH RESULT PAGES
  try {
    // -- get search page URL template and number of search results
    let { sPageLinkTemp, searchResultsCount } = await page.evaluate(() => {
      const sPageLinkTemp = document
        .querySelector(".top .page")
        .href.split("&");

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
    console.log("-->Search page results:", searchPageLinks, searchResultsCount);
  } catch (error) {
    console.log("-->Less than 10 search results found");
    flag = 1;
  }

  let finalData = [];
  if (!flag) {
    // MAIN!!: SCRAPPING DATA
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
        let row = await page.evaluate(() => {
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

        row["Application Link"] = appLink;
        row["Council"] = councilName;
        data.push(row);
      }
      finalData.push(...data);
      console.log("->PROGRESS DATA:", finalData.length);
    }
  } else {
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
      let row = await page.evaluate(() => {
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

      row["Application Link"] = appLink;
      row["Council"] = councilName;
      data.push(row);
    }
    finalData.push(...data);
    console.log("-->PROGRESS DATA:", finalData.length);
  }

  await browser.close();
  console.log(`-->SCRAPPING COMPLETED at ${+new Date()}!!`);

  // CREATE CSV FILE
  convertToCVS(finalData, councilName);
};

const convertToCVS = async (jsonObj, councilName) => {
  console.log(`->Writing CVS`);
  const parserObj = new Parser();
  const csv = parserObj.parse(jsonObj);

  // -- create csv folder
  try {
    await fs.mkdir("../csv-files");
  } catch (error) {
    console.error("-->CSV Folder exists");
  }

  await fs.writeFile(`../csv-files/${councilName}-${+new Date()}.csv`, csv);
  console.log(`->CVS WRITTEN & SAVED for ${councilName} at ${+new Date()}`);
};

getSiteData(councils[1].councilURL, councils[1].councilName);
