const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const urlDatabase = {};

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(cookieParser());

function generateRandomString() {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

////////// GET REQUEST ///////////

app.get("/urls", (req, res) => {
  let templateVars = { 
    username: req.cookies["username"],
    urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { 
    username: req.cookies["username"]};
  res.render("urls_new", templateVars);
});

//server generates a shortURL adds it to urlDatabase
app.get("/urls/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    let templateVars =
  {
    username: req.cookies["username"],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL
  };
    res.render("urls_show", templateVars);
  }
});

//redirect to longURL
app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const fullURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(fullURL);
  }
});


////////// POST REQUEST //////////

app.post("/urls", (req, res) => {
  const randomShort = generateRandomString();
  urlDatabase[randomShort] = {
    shortURL: randomShort,
    longURL: req.body.longURL
  };
  res.redirect(`/urls/${randomShort}`);
});

app.post("/login", (req, res) => {
  res.cookie("username");
  res.redirect('/urls');
});

//delete button function
app.post("/urls/:shortURL/delete", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
  delete urlDatabase[req.params.shortURL];
  };
  res.redirect("/urls")
});

app.post("/logout", (req, res) => {
  res.clearCookie("username", req.body.username);
  res.redirect('/urls');
});

app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
    urlDatabase[shortURL].longURL = req.body.newURL;
    res.redirect('/urls');
});