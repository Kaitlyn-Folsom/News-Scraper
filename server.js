var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var logger = require("morgan");
var path = require("path");

var PORT = 3000;

// Our scraping tools
var axios = require("axios");
var cheerio = require("cheerio");

var request = require("request");

var db = require("./models");

// Initialize Express
var app = express();

var exphbs = require("express-handlebars");
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: false }));
// Use express.static to serve the public folder as a static directory
// app.use(express.static("public"));

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect("mongodb://localhost/NewYorkTimes", {
  useMongoClient: true
});

// Routes
var routes = require("./controllers/controller.js");

app.use("/", routes);

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  db.Article.find({}, function(err, found){
    if(err){
      console.log(err);
    }else{
      res.json(found);
    }
  })
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {

  var articleId = req.params.id;

  db.Article.findOne({
    _id: articleId
  }).populate("note").then(function(dbArticle){
    res.json(dbArticle);
  })
  .catch(function(err){
    res.json(err);
  });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  var articleId = req.params.id;

  db.Note.create(req.body)
  .then(function(dbNote){

    return db.Article.findOneAndUpdate({_id: articleId}, { note:dbNote._id}, {new:true});
  })
  .then(function(dbArticle){
    res.json(dbArticle);
  })
  .catch(function(err){
    res.json(err);
  });
});

app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});