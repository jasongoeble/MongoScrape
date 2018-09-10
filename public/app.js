//post the articles in the database to the screen
$.getJSON("/articles", function (data) {
  // For each one
  for (var i = 0; i < data.length; i++) {
    // Display the apropos information on the page
    $("#articles").append("<h1 class='title' data-id='" + data[i]._id + "'>" + data[i].title + "</h1><p class='summary'>" + data[i].summary + "</p> <a href='" + data[i].link + "'>" + data[i].title + "</a>");
  }
});


$(document).on("click", "p", function () 
{ 
  $("#notes").empty();
  
  var thisId = $(this).attr("data-id");

 //get the article to associate with the note
 //using the graciously supplied content on git lab (shown below)
 //i still cannot get the notes to appear on the page once they are saved
 //to the database....even though they are saving to the database
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    .then(function (data) 
    {
      console.log(data);
      $("#notes").append("<h2>" + data.title + "</h2>");
      $("#notes").append("<input id='titleinput' name='title' >");
      $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
      $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");

      //if data exists in the note
      if (data.note) 
      {
        $("#titleinput").val(data.note.title);
        $("#bodyinput").val(data.note.body);
      }
    });
});

//to save a note
$(document).on("click", "#savenote", function () 
{
  var saveID = $(this).attr("data-id");

  $.ajax({
    method: "POST",
    url: "/articles/" + saveID,
    data: 
    {
      title: $("#titleinput").val(),
      body: $("#bodyinput").val()
    }
  })
    .then(function (data) 
    {
      console.log(data);
      $("#notes").empty();
    });

  //clear them so they don't render on the page anymore
  $("#titleinput").val("");
  $("#bodyinput").val("");
});
