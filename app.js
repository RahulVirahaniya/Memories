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

// Online DB Currently disabled
// const connectionURL = "mongodb+srv://" + process.env.MON_NAME + ":" + process.env.MON_PASS + "@cluster0.ltnlj.mongodb.net/postProject?retryWrites=true&w=majority";
//
// mongoose.connect(connectionURL, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// }, err => {
//   console.log('connected')
// });

// Offline DB
mongoose.connect('mongodb://localhost:27017/Posts', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
// image

var storage = multer.diskStorage({
  destination: 'public/uploads',
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

var upload = multer({
  storage: storage
});


const postSchema = new mongoose.Schema({
  name: String,
  title: String,
  tags: String,
  img: String,
  content: String
});

const Post = mongoose.model("Post", postSchema);



app.get("/", (req, res) => {

  res.render("home");
});

// Fill page

app.get("/fill", (req, res) => {

  res.render("fill");

});

app.post("/fill", (req, res) => {

  res.redirect("/posts");

});

// All posts page

app.get("/posts", (req, res) => {

  Post.find({}, function(err, finalResult) {
    res.render("posts", {
      newListItems: finalResult
    });

  });
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
      // console.log(req.file);
      console.log(result)
    }
  });
  res.redirect("/posts");

});

app.post("/deletePost", (req, res) => {
  let id = req.body.delname;
  let delimage = req.body.delimage;
  Post.deleteOne({
    _id: id
  }, (err) => {
    if (err) {
      console.log(err);
    } else {
      try {
        fs.unlinkSync('public/uploads/' + delimage);
        console.log("Successfully deleted");
        res.redirect("/posts");
      } catch (e) {
        console.log("Error in deleting");
      }

    }
  });

});


//  edit page
app.post("/edit", (req, res) => {

  let ide = req.body.editId;
  Post.findOne({
    _id: ide
  }, (err, results) => {
    if (err) {
      console.log("Not able to edit");
    } else {
      console.log(results);
      res.render("edit", {
        item: results
      });
    }
  });
});

// Save edit

app.post("/saveEdit", (req, res) => {
  let id = req.body.id;
  let name = req.body.name;
  let title = req.body.title;
  let tags = req.body.tags;
  let content = req.body.content;


  Post.findOne({
    _id: id
  }, (err, doc) => {

    if (err) {
      console.log("unable to save edit");
    } else {
      doc.name = name;
      doc.title = title;
      doc.tags = tags;
      doc.content = content;
      doc.save();
      res.redirect("/posts");
    }
  })

});


// Individual page

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
