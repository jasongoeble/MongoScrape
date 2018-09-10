var mongoose = require("mongoose");

//constructor
var Schema = mongoose.Schema;

//properties of new notes
var NoteSchema = new Schema(
  {
  title: String,
  body: String
});

var Note = mongoose.model("Note", NoteSchema);

module.exports = Note;
