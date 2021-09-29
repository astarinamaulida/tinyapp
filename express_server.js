const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

function generateRandomString() {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

const urlDatabase = {};

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// START

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  const randomShort = generateRandomString();
  urlDatabase[randomShort] = {
    shortURL: randomShort,
    longURL: req.body.longURL
  };
  res.redirect(`/urls/${randomShort}`);
});

//server generates a shortURL adds it to urlDatabase
app.get("/urls/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    let templateVars =
  {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL
  };
    res.render("urls_show", templateVars);
  }
});

//delete button function
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params];
  res.redirect("/urls")
});

//redirect to longURL
app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const fullURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(fullURL);
  }
});
