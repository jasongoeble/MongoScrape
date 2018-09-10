var mongoose = require("mongoose");

//constructor
var Schema = mongoose.Schema;

//properties of each article
var ArticleSchema = new Schema({
  title: 
  {
    type: String,
    required: true
  },
  link: 
  {
    type: String,
    required: true
  },
  summary: 
  {
    type: String,
    required: true
  },
  //potentially relatest the Note objects
  note: {
    type: Schema.Types.ObjectId,
    ref: "Note"
  }
});

var Article = mongoose.model("Article", ArticleSchema);

module.exports = Article;
