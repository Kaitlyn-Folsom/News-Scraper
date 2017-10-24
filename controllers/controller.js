var express = require("express");
var router = express.Router();
var cheerio = require("cheerio");
var request = require("request");

var mongoose = require("mongoose");
mongoose.Promise = Promise;

// Import the model to use its database functions.
var Article = require("../models/Article.js");
var Note = require("../models/Note.js");

router.get("/", function(req, res) {
  res.render("article");
});

router.get("/savedarticles", function(req, res) {

  // Grab every doc in the Articles array
  Article.find({}, function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Or send the doc to the browser as a json object
    else {
      var hbsArticleObject = {
        articles: doc
      };

      res.render("saved", hbsArticleObject);
    }
  });
});

var scrapedArticles = {};
console.log(scrapedArticles);

// A GET route for scraping the echojs website
router.post("/scrape", function(req, res) {
  // First, we grab the body of the html with request
  request("http://www.nytimes.com/pages/todayspaper/index.html?action=Click&module=HPMiniNav&region=TopBar&WT.nav=page&contentCollection=TodaysPaper&pgtype=Homepage", function(error, response, html) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(html);
    // Now, we grab every h2 within an article tag, and do the following:

    $("div.story").each(function(i, element){
    // $("h2.story-heading").each(function(i, element) {
      // Save an empty result object
      var result = {};

      result.title = $(this).children("h3").children("a").text();
      result.summary = $(this).children("p.summary").text();
      result.link =  $(this).children("h3").children("a").attr("href");

      scrapedArticles[i] = result;
    });

    console.log("Scraped Articles object built nicely: " + scrapedArticles);

    var hbsArticleObject = {
        articles: scrapedArticles
    };

    res.render("article", hbsArticleObject);

  });
});



module.exports = router;