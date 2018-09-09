var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");
var db = require("./models");

var PORT = 3000;

var app = express();

app.use(logger("dev"));

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));

//connect to the database
mongoose.connect("mongodb://localhost/slashdot");

app.get("/scrape", function(req, res) 
{  
  axios.get("https://slashdot.org").then(function(response) 
  {
    //load it into cheerio
    var $ = cheerio.load(response.data);
 
    var result = {};

    var storyTitle = [];
    var storyLink = [];
    var storySummary = [];

    //grab every article title and link, which is tagged on slashdot as span tag  with a class of story-title
    $("span.story-title").each(function(i,element)
    {
      storyTitle.push($(this).children("a").text());
      storyLink.push("http:" + $(this).children("a").attr("href"));
    });

    $("div.p").each(function(l,element)
    {
      storySummary.push($(this).children("i").text());

    });

    for (x = 0; x <  storyTitle.length; x++)
    {

      result = 
      {
        title: storyTitle[x],
        link: storyLink[x],
        summary: storySummary[x]
      };

      //create the article
      db.Article.create(result)
        .then(function(dbArticle) 
        {
          //console log the artcile
          console.log(dbArticle);
        })
        .catch(function(err) 
        {
          //handle an error by returning it to the console if it occurs
          return res.json(err);
        });
      }
    });
      //if successful, send message to user that it was good
      res.send("Scrape of http://slashdot.org is complete");
  });
//});

//retrieve the articles from the database
app.get("/articles", function(req, res) 
{
  //get all of them
  db.Article.find({})
    .then(function(dbArticle) 
    {
      //respond with successful retrieval
      res.json(dbArticle);
    })
    .catch(function(err) 
    {
      //catch to handle error situation
      res.json(err);
  });
});

//grab articles by their mongodb _id
app.get("/articles/:id", function(req, res) 
{
  //get the specific id based on user selection
  db.Article.findOne({ _id: req.params.id })

    //add any existing notes
    .populate("Note")
    .then(function(dbArticle) 
    {
      //respond with successful retrieval
      res.json(dbArticle);
    })
    .catch(function(err) 
    {
      //catch to handle error situation
      res.json(err);
    });
});

//mongoose "U" CRUD function to update notes
app.post("/articles/:id", function(req, res) 
{
  //capture new note in the request body
  db.Note.create(req.body)
    .then(function(dbNote) 
    {
      //given an article (_id) and a new note(with a passed parameter id that matches) update the artcile
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { Note: dbnote._id }, { new: true });
    })
    .then(function(dbArticle) 
    {
      //respond with successful update operation
      res.json(dbArticle);
    })
    .catch(function(err) 
    {
      //catch to handle error situation
      res.json(err);
    });
});

//start server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
