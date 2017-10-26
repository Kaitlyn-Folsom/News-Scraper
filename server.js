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
app.use(express.static("public"));

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect("mongodb://localhost/NewYorkTimes", {
  useMongoClient: true
});

// Routes
var routes = require("./controllers/controller.js");

app.use("/", routes);

app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});