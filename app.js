//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const dotenv = require('dotenv');
var fs = require('fs');
var path = require('path');
var multer = require('multer');

require('dotenv/config');

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static(__dirname + "/public"));

const connectionURL = "mongodb+srv://" + process.env.MON_NAME + ":" + process.env.MON_PASS + "@cluster0.ltnlj.mongodb.net/postProject?retryWrites=true&w=majority";

mongoose.connect(connectionURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}, err => {
  console.log('connected')
});

// image

var storage = multer.diskStorage({
  destination: 'public/uploads'
  ,
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname) );
  }
});

var upload = multer({
  storage: storage
});
//


const postSchema = new mongoose.Schema({
  name: String,
  title: String,
  tags: String,
  img: String,
  content: String
});

const Post = mongoose.model("Post", postSchema);

const defaultItems = [];

app.get("/", (req, res) => {

  res.render("home");
});

app.get("/posts", (req, res) => {

  Post.find({}, function(err, finalResult) {
      res.render("posts", {
        newListItems: finalResult
      });

  });
});

app.get("/fill", (req, res) => {

  res.render("fill");

});

app.post("/fill", (req, res) => {

  res.redirect("/posts");

});

app.post("/posts", upload.single('userPhoto'), (req, res) => {

  let name = req.body.name;
  let title = req.body.title;
  let tags = req.body.tags;
  let content = req.body.content;

  const post = new Post({

    name: name,
    title: title,
    tags: tags,
    img: req.file.filename,
    content: content
  });
  post.save((err, result) => {
    if (err) {
      console.log(err);
    } else {
      console.log(req.file);
      console.log(result)
    }
  });
  res.redirect("/posts");

});

app.get("/posts/:postName", (req, res) => {

  Post.findOne({
    _id: req.params.postName
  }, (err, docs) => {

    if (err) {
      console.log("there was some error");
    } else {
      res.render("post", {
        doc: docs
      });
    }

  });

});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
