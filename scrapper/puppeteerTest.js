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

  //console.log(test);

  try {
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
  } catch (error) {
    console.error("Time out error. Try again after sometime");
  }

  const { linksList, linksText, linkRefNo } = await page.evaluate(() => {
    const linkElementsList = document.querySelectorAll(".searchresult");
    let linkRefNo = [];
    let linksList = [];
    let linksText = [];
    linkElementsList.forEach((link) => {
      linksList.push(link.querySelector("a").href);
      linkRefNo.push(link.querySelector(".metaInfo").innerText.trim());
      linksText.push(link.querySelector("a").innerText);
    });

    return { linksList, linksText, linkRefNo };
  });

  console.log("Ref. No.", linkRefNo);
  console.log("Links List", linksList);
  console.log("Links Text:", linksText);

  // BROWSER CLOSE
  await browser.close();
};

start(urlSearchPage);
