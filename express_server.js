const bcrypt = require('bcrypt');
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const { userDb, urlDatabase, getUserByEmail, generateRandomString, addNewUser, urlsForUser } = require("./helpers");

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ['ASTARINA'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));


/////////////// / ///////////////

app.get("/", (req, res) => {
  if (req.session["user_id"]) {
    return res.redirect("/urls");
  } else {
    return res.redirect("/login");
  }
});


////////////// URLS //////////////

app.get("/urls", (req, res) => {
  const userID = req.session["user_id"];
  const user = userDb[userID];
  if (!user) {
    return res.status(401).send("<h1>Oops!</h1> <p>You must <a href='/login'>login</a> to access the page.<p>");
  }
  const urls = urlsForUser(user.id);
  const templateVars = { urls, user };
  return res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  if (userDb[req.session["user_id"]]) {
    const randomShort = generateRandomString();
    urlDatabase[randomShort] = {
      longURL: req.body.longURL,
      userID: req.session["user_id"]
    };
    return res.redirect(`/urls/${randomShort}`);
  }
});


//////////// URLS/NEW ////////////

app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: userDb[req.session["user_id"]]
  };
  if (templateVars.user) {
    return res.render("urls_new", templateVars);
  }
  return res.render("urls_login", templateVars);
});


///////// URLS/:SHORTURL /////////

//server generates a shortURL adds it to urlDatabase
app.post("/urls/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL].userID === req.session["user_id"]) {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
    return res.redirect(`/urls`);
  } else {
    return res.status(401).send("<h1>Oops!</h1> <p>You must <a href='/login'>login</a> to access the page.<p>");
  }
});

app.get("/urls/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    let templateVars =
    {
      user: userDb[req.session["user_id"]],
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL
    };
    return res.render("urls_show", templateVars);
  }
  return res.status(401).send("<h1>Sorry!</h1> <p>The TinyURL does not exist! </p><p>Please enter the correct TinyURL address.<p>");
});

//delete button function
app.post("/urls/:shortURL/delete", (req, res) => {
  if (urlDatabase[req.params.shortURL].userID === req.session["user_id"]) {
    delete urlDatabase[req.params.shortURL];
    return res.redirect("/urls");
  } else {
    return res.status(401).send("<h1>Oops!</h1> <p>You must <a href='/login'>login</a> to access the page.<p>");
  }
});


///////// U/:SHORTURL /////////

//redirect to longURL
app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const fullURL = urlDatabase[req.params.shortURL].longURL;
    return res.redirect(fullURL);
  }
});


////////// /REGISTER //////////

app.get("/register", (req, res) => {
  let templateVars = {
    user: null
  };
  return res.render("urls_registration", templateVars);
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, userDb);
  if (user) {
    return res.status(401).send('<h1>Sorry!</h1><p>User already exists.</p>');
  }
  if (email === "" || password === "") {
    return res.status(400).send('<h1>Error!</h1> <p>You need to enter values for email and password.</p>');
  }
  const userID = addNewUser(email, password, userDb);
  req.session["user_id"] = userID;
  return res.redirect("/urls");
});


/////////// /LOGIN ////////////

app.get("/login", (req, res) => {
  let templateVars = {
    user: userDb[req.session["user_id"]]
  };
  return res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, userDb);
  if (!user) {
    res.status(401).send('<h1>Error!</h1> <p>Email not found.</p>');
  } else if ((!bcrypt.compareSync(password, user.password))) {
    res.status(401).send('<h1>Error!</h1> <p>Password is incorrect.</p>');
  } else {
    req.session["user_id"] = user.id;
    return res.redirect("/urls");
  }
});


/////////// /LOGOUT ////////////

app.post("/logout", (req, res) => {
  req.session = null;
  return res.redirect("/urls");
});

///////////// PORT /////////////

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});