var db = require("../../models");
var axios = require("axios");

module.exports = function(app)
{
  app.get("/scrape", function(req, res) 
  {  
    axios.get("https://slashdot.org").then(function(response) 
    {
      //load it into cheerio
      var $ = cheerio.load(response.data);
  
      var result = {};

      //setup arrays to store each component
      var storyTitle = [];
      var storyLink = [];
      var storySummary = [];

      //grab the title and the link from the span with class story-title
      //push the individual components into individual arrays, in the order in which they appear
      $("span.story-title").each(function(i,element)
      {
        storyTitle.push($(this).children("a").text());
        storyLink.push("http:" + $(this).children("a").attr("href"));
      });

      //grab the summary from the div with class p
      //push the elements into an array in the order in which it appears
      $("div.p").each(function(l,element)
      {
        storySummary.push($(this).children("i").text());
      });

      //because the title, link, and summary all follow the order of the page
      //the for loop combines them into a result object and then creates a mongodb collection
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
};