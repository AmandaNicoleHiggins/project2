// Get references to page elements
var $movieText = $("#movie-text");
var $bookText = $("#book-text");
var $gameText = $("#game-text");
var $submitMovieBtn = $("#submitMovie");
var $submitBookBtn = $("#submitBook");
var $submitGameBtn = $("#submitGame");
var $movieList = $("#movie-list");
var $bookList = $("#book-list");
var $gameList = $("#game-list");
var $exampleDescription = $("#example-description");
var $exampleList = $("#example-list");
var addMovieButton;

// // The API object contains methods for each kind of request we'll make
var API = {
//   saveExample: function(example) {
//     return $.ajax({
//       headers: {
//         "Content-Type": "application/json"
//       },
//       type: "POST",
//       url: "api/examples",
//       data: JSON.stringify(example)
//     });
//   },

  addCompleted: function(doneTask) {
    return $.ajax({
      url: "api/completed",
      type: "POST",
      data: JSON.stringify(doneTask)
    });
  },
  getExamples: function() {
    return $.ajax({
      url: "api/examples",
      type: "GET"
    });
  },
  deleteExample: function(id) {
    return $.ajax({
      url: "api/examples/" + id,
      type: "DELETE"
    });
  }
};

// refreshExamples gets new examples from the db and repopulates the list
var refreshExamples = function() {
  API.getExamples().then(function(data) {
    var $examples = data.map(function(example) {
      var $a = $("<a>")
        .text(example.text)
        .attr("href", "/example/" + example.id);

      var $li = $("<li>")
        .attr({
          class: "list-group-item",
          "data-id": example.id
        })
        .append($a);

      var $button = $("<button>")
        .addClass("btn btn-danger float-right delete")
        .text("ｘ")
        .attr("id", example.text);

      $li.append($button);

      return $li;
    });

    $exampleList.empty();
    $exampleList.append($examples);
  });
};

refreshExamples();

var handleMovieFormSubmit = function(event) {
  event.preventDefault();
  var movieQuery
  movieQuery = $movieText.val().trim().split(" ").join("+");
  console.log("The movie query is: " + movieQuery);
  
  $.ajax({
    url: "https://www.omdbapi.com/?t=" + movieQuery + "&y=&plot=short&apikey=trilogy",
    method: "GET"
  }).then(function(response) {
    var newMovieTitle = $("<p>").text("Movie Title: " + response.Title).attr("id", "newMovie-heading");
    var newMoviePlot = $("<p>").text("Plot: " + response.Plot);
    var newMoviePoster = $("<img>").attr("src",  response.Poster);

    var addMovieButton =  $('<button>').text("Add to To Dos").attr("id", response.Title).addClass("btn btn-info");

    
    $movieList.append('<li>');
    $movieList.append(newMovieTitle, newMoviePlot, newMoviePoster, addMovieButton);
    $movieList.append('</li>');

    addMovieButton.on("click", addtoToDo);
  });  
  $movieText.val("");    
};
  
var handleBookFormSubmit = function(event) {
  event.preventDefault();
  var bookQuery
  bookQuery = $bookText.val().trim().split(" ").join("+");
  console.log("The book query is: " + bookQuery);
  
  $.ajax({
    url: "https://www.googleapis.com/books/v1/volumes/?q=" + bookQuery + "&key=AIzaSyD6fZh0lQSvHpa3XivKX12LMo6_rSTjWK4",
    method: "GET"
  }).then(function(books) {
    $.each(books['items'], function (index, book) {
      var BookCoverUrl = ( book['volumeInfo']['imageLinks'] !== undefined ) ? book['volumeInfo']['imageLinks']['thumbnail'] : 'https://d827xgdhgqbnd.cloudfront.net/wp-content/uploads/2016/04/09121712/book-cover-placeholder.png';
      var BookHTML = 'Book Title: ' + book['volumeInfo']['title'] + '<br>' +
      'Author(s): ' + book['volumeInfo']['authors'].join(', ') + '<br>' +
      '<img src="' + BookCoverUrl + '">';
      var addBookButton = $('<button id="' + book['volumeInfo']['title'] + '" class="btn btn-info">Add to To Dos</button>');

      $bookList.append('<li>');
      $bookList.append(BookHTML, addBookButton);
      $bookList.append('</li>');

      addBookButton.on("click", addtoToDo);
    });
  });
  $bookText.val("");    
};

var handleGameFormSubmit = function(event) {
  event.preventDefault();
  var gameQuery;
  gameQuery = $gameText.val().trim().split(" ").join("+");
  console.log("The game query is: " + gameQuery);
  
  $.ajax({
    url: "https://cors-anywhere.herokuapp.com/https://www.giantbomb.com/api/search/?api_key=9a02d4d2e88aa4d1ec2e2c72519e9b710c37136e&format=json&query=" + gameQuery,
    method: "GET"
  }).then(function(response) {
    console.log(response);
    var newGameTitle = $("<p>").text("Game Title: " + response.results[0].name).attr("id", "newGame-heading");
    var newGameDesc = $("<p>").text("Description: " + response.results[0].deck);
    var newGameImage = $("<img>").attr("src",  response.results[0].image.thumb_url);
    var addGameButton =  $('<button>').text("Add to To Dos").attr("id", response.results[0].name).addClass("btn btn-info");
    
    $gameList.append('<li>');
    $gameList.append(newGameTitle, newGameDesc, newGameImage, addGameButton);
    $gameList.append('</li>');

    addGameButton.on("click", addtoToDo);
  });  
  $gameText.val("");    
};
    
var addtoToDo = function(event) {
  console.log("add button clicked");
  console.log(this.id);
  event.preventDefault();
  var newAdd = {
    text: this.id
  };
  $.ajax("/api/examples", {
    type: "POST",
    data: newAdd
  }).then(function () {
    refreshExamples();
  });
};

var completedDate;
function getDate() {
  completedDate = new Date();
  return completedDate;
}

var handleDeleteBtnClick = function() {
    var idToDelete = $(this)
    .parent()
    .attr("data-id");

    var doneTask = {
      text: this.id,
      date: getDate()
    }

    console.log(doneTask.text);
    console.log(doneTask.date);

    $.ajax("/api/completed", {
      type: "POST",
      data: doneTask
    }).then(function () {
      console.log("completed task posted")
      refreshExamples();
    });

  API.deleteExample(idToDelete).then(function() {
    refreshExamples();
  });
};

// // Add event listeners to the submit and delete buttons
$submitMovieBtn.on("click", handleMovieFormSubmit);
$submitBookBtn.on("click", handleBookFormSubmit);
$submitGameBtn.on("click", handleGameFormSubmit);
$exampleList.on("click", ".delete", handleDeleteBtnClick);


// // Get references to page elements
// var $exampleText = $("#example-text");
// var $exampleDescription = $("#example-description");
// var $submitMovieBtn = $("#submit");
// var $exampleList = $("#example-list");

// // The API object contains methods for each kind of request we'll make
// var API = {
//   saveExample: function(example) {
//     return $.ajax({
//       headers: {
//         "Content-Type": "application/json"
//       },
//       type: "POST",
//       url: "api/examples",
//       data: JSON.stringify(example)
//     });
//   },
//   getExamples: function() {
//     return $.ajax({
//       url: "api/examples",
//       type: "GET"
//     });
//   },
//   deleteExample: function(id) {
//     return $.ajax({
//       url: "api/examples/" + id,
//       type: "DELETE"
//     });
//   }
// };

// // refreshExamples gets new examples from the db and repopulates the list
// var refreshExamples = function() {
//   API.getExamples().then(function(data) {
//     var $examples = data.map(function(example) {
//       var $a = $("<a>")
//         .text(example.text)
//         .attr("href", "/example/" + example.id);

//       var $li = $("<li>")
//         .attr({
//           class: "list-group-item",
//           "data-id": example.id
//         })
//         .append($a);

//       var $button = $("<button>")
//         .addClass("btn btn-danger float-right delete")
//         .text("ｘ");

//       $li.append($button);

//       return $li;
//     });

//     $exampleList.empty();
//     $exampleList.append($examples);
//   });
// };

// // handleMovieFormSubmit is called whenever we submit a new example
// // Save the new example to the db and refresh the list
// var handleMovieFormSubmit = function(event) {
//   event.preventDefault();

//   var example = {
//     text: $exampleText.val().trim(),
//     description: $exampleDescription.val().trim()
//   };

//   if (!(example.text && example.description)) {
//     alert("You must enter an example text and description!");
//     return;
//   }

//   API.saveExample(example).then(function() {
//     refreshExamples();
//   });

//   $exampleText.val("");
//   $exampleDescription.val("");
// };

// // handleDeleteBtnClick is called when an example's delete button is clicked
// // Remove the example from the db and refresh the list
// var handleDeleteBtnClick = function() {
//   var idToDelete = $(this)
//     .parent()
//     .attr("data-id");

//   API.deleteExample(idToDelete).then(function() {
//     refreshExamples();
//   });
// };

// // Add event listeners to the submit and delete buttons
// $submitMovieBtn.on("click", handleMovieFormSubmit);
// $exampleList.on("click", ".delete", handleDeleteBtnClick);
