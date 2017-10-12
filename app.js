var express = require("express");
var app = express();
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var request = require("request");

mongoose.connect(process.env.MONGO_URI);
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

var searchSchema = new mongoose.Schema({
  term: String,
  created: {type: Date, default: Date.now}
});
var Search = mongoose.model("Search", searchSchema);

app.get("/", function(req, res){
  res.render("index");
});

app.post("/results", function(req, res){
  var term = req.body.query.term;
  var offset = req.body.offset * 10;
  var url = "https://www.googleapis.com/customsearch/v1?key=" + process.env.API_KEY + "&cx=016776995519454032958:ffcvypxnoqe&searchType=image&start=" + offset + "&q=" + term;
  if (term != false) {
    Search.create(req.body.query, function(err, data){
      if (err) {
        console.log(err);
      } else {
        console.log("New search entry created!");
        console.log(data);
      }
    });
  }
  request(url, function(error, response, body){
    if (!error & response.statusCode == 200) {
      var data = JSON.parse(body).items;
      res.render("results", {images: data});
    }
  });
});

app.get("/recent", function(req, res){
  Search.find({}).sort({created: -1}).limit(10).exec(function(err, data){
    if (err) {
      console.log(err);
    } else {
      res.render("recent", {searches: data});
    }
  });
});

app.listen(process.env.PORT, process.env.IP, function(){
  console.log("Server Online...");
});
