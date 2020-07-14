// Dotenv is a zero-dependency module that loads environment variables from a .env file into process.env, Storing configuration in the environment separate from code.
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
// mongoose-encryption is a simple encryption and authentication tool for mongoose documents.
const encrypt = require("mongoose-encryption");

const app = express();

app.set("view engine", "ejs");
// Serving static files in Express
app.use(express.static("public"));

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// use mongoose to connect to mongoDB
mongoose.connect("mongodb://localhost:27017/userDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// create userDB Schema
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

// define a secret (const secret = "Thisisourlittlesecret."; was defined and saved in the .env file) to be used with mongoose-encryption
// mongoose-encryption requires that the line below be added before the mongoose model. The below only encrypts the password using mongoose-encryption
userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ["password"] });

// create UserDB model
const User = new mongoose.model("User", userSchema);

app.get("/", function (req, res) {
  res.render("home");
});
app.get("/login", function (req, res) {
  res.render("login");
});
app.get("/register", function (req, res) {
  res.render("register");
});

// user creates a collection containing their username and password when they go to the register page
app.post("/register", function (req, res) {
  // create user collection
  const newUser = new User({
    email: req.body.username,
    password: req.body.password,
  });
  //   save newUser and check if there are any errors else render the secrets.ejs page
  newUser.save(function (err) {
    if (err) {
      console.log(err);
    } else {
      res.render("secrets");
    }
  });
});

// next allow the user to login once they've registered
app.post("/login", function (req, res) {
  // the user's username and password are supplied (req.body.username & req.body.password) and saveed as constants username and password
  const username = req.body.username;
  const password = req.body.password;
  //   find the user whose email equals the username provided

  User.findOne({ email: username }, function (err, foundUser) {
    if (err) {
      console.log(err);
    }
    // log err if any else if the user is found(foundUser), check if the password in the database (foundUser.password) equals the password provided (password = req.body.password)
    else {
      if (foundUser) {
        if (foundUser.password === password) {
          res.render("secrets");
        }
      }
    }
  });
});
app.listen(3000, function () {
  console.log("Server started on port 3000");
});
