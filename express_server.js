const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const urlDatabase = {};
const userDb = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(cookieParser());

////////// FUNCTION //////////

function generateRandomString() {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

const addNewUser = function (email, password, users) {
  let userId = generateRandomString();
  users[userId] = {
    id: userId,
    email,
    password
  };
  return userId;
}

const findUserByEmail = function (email, users) {
  for (let userId in users) {
    const user = users[userId];
    if (email === user.email) {
      return user;
    }
  }
  return false
};

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


//////////// / //////////// 

app.get("/", (req, res) => {
  if (userDb[req.cookies["user_id"]]) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});


//////////// URLS ////////////

app.get("/urls", (req, res) => {
  let templateVars = {
    user: userDb[req.cookies["user_id"]],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const randomShort = generateRandomString();
  urlDatabase[randomShort] = {
    shortURL: randomShort,
    longURL: req.body.longURL
  };
  res.redirect(`/urls/${randomShort}`);
});


//////////// URLS/NEW ////////////

app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: userDb[req.cookies["user_id"]]
  };
  res.render("urls_new", templateVars);
});


///////// URLS/:SHORTURL /////////

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  if (urlDatabase[shortURL]) {
    urlDatabase[shortURL].longURL = longURL;
    res.redirect(`/urls/${shortURL}`)
  }
});

//server generates a shortURL adds it to urlDatabase
app.get("/urls/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    let templateVars =
    {
      user: userDb[req.cookies["user_id"]],
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL
    };
    res.render("urls_show", templateVars);
  }
});

//delete button function
app.post("/urls/:shortURL/delete", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    delete urlDatabase[req.params.shortURL];
  };
  res.redirect("/urls")
});

///////// U/:SHORTURL /////////

//redirect to longURL
app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const fullURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(fullURL);
  }
});

///////// /REGISTER /////////

app.get("/register", (req, res) => {
  let templateVars = {
    user: null
  };
  res.render("urls_registration", templateVars)
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = findUserByEmail(email, userDb);
  if (user) {
    return res.status(401).send('<h1>Sorry!</h1><p>User already exists.</p>');
  }
  if (email === "" || password === "") {
    return res.status(400).send('<h1>Error!</h1> <p>You need to enter values for email and password.</p>');
  }
  const userId = addNewUser(email, password, userDb)
  res.cookie("user_id", userId);
  res.redirect("/urls");
});


////////// /LOGIN ///////////

app.get("/login", (req, res) => {
  let templateVars = {
    user: userDb[req.cookies["user_id"]]
  };
  res.render("urls_login", templateVars)
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = findUserByEmail(email, userDb);
  if (user && user.password === password) {
    res.cookie("user_id", user.id)
    res.redirect("/urls");
    return;
  }
  if (user && user.password !== password || user.email !== email) {
    return res.send('<h1>Error!</h1> <p>Please insert correct email and password.</p>')
  }
  if (!user) {
    res.status(401).send('<h1>Error!</h1> <p>User not found.</p>')
  }
});


////////// /LOGOUT ///////////

app.post("/logout", (req, res) => {
  res.clearCookie("user_id", req.body.userId);
  res.redirect('/urls');
});

////////// /URLS/:ID ///////////

app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  urlDatabase[shortURL].longURL = req.body.newURL;
  res.redirect('/urls');
});
