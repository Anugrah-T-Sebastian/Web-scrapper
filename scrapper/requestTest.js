const request = require("request");
const cheerio = require("cheerio");
const urlWikipedia = "https://en.wikipedia.org/wiki/ISO_3166-1_alpha-3";
const urlBooks =
  "https://books.toscrape.com/catalogue/category/books/mystery_3/index.html";
const urlSearch =
  "https://publicaccess.glasgow.gov.uk/online-applications/pagedSearchResults.do?action=page&searchCriteria.page=2";

request(urlSearch, (error, response, html) => {
  if (!error && response.statusCode == 200) {
    const $ = cheerio.load(html);

    //console.log($);

    const siteHeading = $(".sr-only");
    console.log("Site Heading", siteHeading);
  }
});
