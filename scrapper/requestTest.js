const request = require("request");
const cheerio = require("cheerio");
const urlWikipedia = "https://en.wikipedia.org/wiki/ISO_3166-1_alpha-3";
const urlBooks =
  "https://books.toscrape.com/catalogue/category/books/mystery_3/index.html";

request(urlBooks, (error, response, html) => {
  if (!error && response.statusCode == 200) {
    const $ = cheerio.load(html);

    const siteHeading = $("h1");
    console.log("Site Heading", siteHeading.text());
  }
});
