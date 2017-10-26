$(document).on("click", "#notesModalBtn", function() {

  console.log("notes btn clicked");
  // Empty the notes from the note section
  // $("#notes").empty();
  // Save the id from the p tag
  var thisId = $(this).attr("data-id");

  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    // With that done, add the note information to the page
    .done(function(data) {
      console.log(data);
      // The title of the article
      $("#myModalTitle").text(data.title);

      $("#notes").append("<p id='actualnotes'></p>");

      // If there's a note in the article
      if (data.note) {
        console.log(data.note);
        //begin an unordered list of appended notes
        $("#actualnotes").append("<ul id='notelist'>");

          for (var i = 0; i < data.note.length; i++) {
              $('#notelist').append("<li id='" + data.note[i]._id + "'>" + data.note[i].body + " " +
              "<button data-id='" + data.note[i]._id +
              "' id='deletenote'>X</button></li>");
              console.log(data.note.body);
          }

        $("#actualnotes").append("</ul>");

      }else{
        //if there are no notes for that article
        $('#actualnotes').text("There aren't any notes yet.");
        console.log("No notes for this article");
      }
      // A textarea to add a new note body
      $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
      // A button to submit a new note, with the id of the article saved to it
      $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");
    });
});

// When you click the savenote button
$(document).on("click", "#savenote", function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {

      body: $("#bodyinput").val()
    }
  }).done(function(data) {

      console.log(data);
      // Empty the notes section
      $("#notelist").empty();

      for (var i = 0; i < data.note.length; i++) {
        $("#notelist").append("<li id='" + data.note[i]._id + "'>" + data.note[i].body + " " + "<button data-id='" + data.note[i]._id +
        "' id='deletenote'>X</button></li>");
      }
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#bodyinput").val("");

  console.log("note saved");
});

$(document).on("click", "#deletenote", function() {
  // Grab the id associated with the note
  console.log("delete note btn clicked 😎");
  var thisId = $(this).attr("data-id");
  // Run a POST request to delete the note
  $.ajax({
    method: "GET",
    url: "/note/" + thisId,
  })
    // With that done
    .done(function(data) {
      $("#" + data._id).remove();
    });
});

