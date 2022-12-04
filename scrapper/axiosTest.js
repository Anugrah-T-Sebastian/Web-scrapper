const cheerio = require("cheerio");
const axios = require("axios");
const pretty = require("pretty");
const url = "https://www.glasgow.gov.uk/";
const urlBooks =
  "https://books.toscrape.com/catalogue/category/books/mystery_3/index.html";

async function getTest(url) {
  try {
    //const response = await axios.get(url);
    notifications = await axios.request({
      method: "GET",
      url: url,
      responseType: "arraybuffer",
      reponseEncoding: "binary",
    });
    let html = notifications.data.toString("latin1");
    console.log(html);
    //console.log(response.data);
    // console.log(response.status);
    // console.log(response.statusText);
    // console.log(response.config);

    // console.log("--Cheerio--");
    //console.log($);
    //console.log($.html());
    // const test = $("h1");

    // console.log("TEST", test.html());

    // test.each((idx, el) => {
    //   let text = "";
    //   text = $(el).text();
    //   console.log(text);
    // });
  } catch (error) {
    console.error(error);
  }
}

// const getPageDOm = async (url) => {
//   const DOM = await request(url);
//   console.log(DOM.html);
//   // const $ = cheerio.load(DOM.html);
//   // const siteHeading = $("h1");
//   // console.log("Site Heading", siteHeading.text());
// };

getTest(url);
