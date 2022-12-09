const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const osmosis = require("osmosis");

// URL of the page we want to scrape
const url = "https://en.wikipedia.org/wiki/ISO_3166-1_alpha-3";
const urlSearch =
  "https://publicaccess.glasgow.gov.uk/online-applications/pagedSearchResults.do?action=page&searchCriteria.page=2";

const getList = (url) => {
  let page = await;
};
