var express = require("express");
var router = express.Router();
var request = require("request");

var axios = require("axios");
var cheerio = require("cheerio");

var mongoose = require("mongoose");
mongoose.Promise = Promise;

// Import the model to use its database functions.
var Article = require("../models/Article.js");
var Note = require("../models/Note.js");

router.get("/", function(req, res) {
  res.render("article");
});

// scraping New York Times
router.post("/scrape", function(req, res) {

  axios.get("http://www.nytimes.com/pages/todayspaper/index.html?action=Click&module=HPMiniNav&region=TopBar&WT.nav=page&contentCollection=TodaysPaper&pgtype=Homepage").then( function(response) {

    var $ = cheerio.load(response.data);

    $("div.story").each(function(i, element){

      var result = {};

      result.title = $(this).children("h3").children("a").text();
      result.summary = $(this).children("p.summary").text();
      result.link =  $(this).children("h3").children("a").attr("href");

      scrapedArticles[i] = result;
    });

    var hbsArticleObject = {
        articles: scrapedArticles
    };

    res.render("article", hbsArticleObject);

  });
});

// Get the articles scraped and saved in db and display
router.get("/savedarticles", function(req, res) {

  // Grab article in the Articles array
  Article.find({}, function(error, article) {

    if (error) {
      console.log(error);
    }
    else {
      var hbsArticleObject = {
        articles: article
      };
      res.render("saved", hbsArticleObject);
    }
  });
});

var scrapedArticles = {};
console.log(scrapedArticles);

//Save the chosen article ID to the database and display on saved articles page
router.post("/save", function(req, res) {

  var newArticleObject = {};

  newArticleObject.title = req.body.title;
  newArticleObject.summary = req.body.summary;
  newArticleObject.link = req.body.link;

  var entry = new Article(newArticleObject);

  console.log("Saved Article: " + entry);

  // save to database
  entry.save(function(err, article) {
    if (err) {
      console.log(err);
    }
    else {
      console.log(article);
    }
  });

  res.redirect("/savedarticles");

});

router.post("/delete/:id", function(req, res) {

  Article.findOneAndRemove({"_id": req.params.id}, function (err, offer) {
    if (err) {
      console.log(err);
    } else {
      console.log("Article deleted: " + req.params.id);
    }
    res.redirect("/savedarticles");
  });
});

router.get("/articles/:id", function(req, res) {

  console.log("This article ID is: " + req.params.id);

  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  Article.findOne({"_id": req.params.id})

  .populate('note')

  .exec(function(err, doc) {
    if (err) {
      console.log(err);
    }
    else {
      res.json(doc);
    }
  });
});

// Create a new note or replace an existing note
router.post("/articles/:id", function(req, res) {

  // Create a new note and pass the req.body to the entry
  var newNote = new Note(req.body);
  // And save the new note the db
  newNote.save(function(error, data) {
    // Log any errors
    if (error) {
      console.log(error);
    } 
    else {
      // Use the article id to find it and then push note
      Article.findOneAndUpdate({ "_id": req.params.id }, {$push: {note: data._id}}, {new: true, upsert: true})

      .populate("note")

      .exec(function (err, data) {
        if (err) {
          console.log("Cannot find article.");
        } else {
          res.send(data);
        }
      });
    }
  });
});

router.get("/note/:id", function(req, res) {

  Note.findOneAndRemove({"_id": req.params.id}, function (err, data) {
    if (err) {
      console.log(err);
    } else {
      console.log("Note Deleted");
    }
    res.send(data);
  });
});

module.exports = router;