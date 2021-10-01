const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const e = require("express");
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
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
const urlDatabase = {
  b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "aJ48lW"
  },
  i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "aJ48lW"
  }
};

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
  let userID = generateRandomString();
  users[userID] = {
    id: userID,
    email,
    password
  };
  return userID;
}

const findUserByEmail = function (email, users) {
  for (let userID in users) {
    const user = users[userID];
    if (email === user.email) {
      return user;
    }
  }
  return false
};

const urlsForUser = function (id) {
  const filterId = {};
  const keys = Object.keys(urlDatabase);

  for (const shortURL of keys) {
    const url = urlDatabase[shortURL];
    if (url.userID === id) {
      filterId[shortURL] = url;
    }
    console.log({userId: url.userID, id, isMatching: url.userID === id})
    //console.log(`userID: ${userID}`);
    console.log(`key: ${keys}`)
  }
  return filterId;
};

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


//////////// / //////////// 

app.get("/", (req, res) => {
  if (userDb[req.cookies["user_id"]]) {
    return res.redirect("/urls");
  } else {
    return res.redirect("/login");
  }
});


//////////// URLS ////////////

app.get("/urls", (req, res) => {
  const userID = req.cookies["user_id"];
  const user = userDb[userID];
  if(!user) {
    return res.status(401).send("<h1>Oops!</h1> <p>You must <a href='/login'>login</a> to access the page.<p>")
  }
  const urls = urlsForUser(user.id);
  const templateVars = { urls, user };
  console.log(urls)
  return res.render("urls_index", templateVars);
});


app.post("/urls", (req, res) => {
  if(userDb[req.cookies["user_id"]]){
  const randomShort = generateRandomString();
  urlDatabase[randomShort] = {
    longURL: req.body.longURL,
    userID: req.cookies["user_id"]
  };
  console.log(urlDatabase[randomShort])
  return res.redirect(`/urls/${randomShort}`);
}
});


//////////// URLS/NEW ////////////

app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: userDb[req.cookies["user_id"]]
  };
  if (templateVars.user) {
    return res.render("urls_new", templateVars);
  }
  return res.render("urls_login", templateVars);
});


///////// URLS/:SHORTURL /////////

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  if (urlDatabase[shortURL]) {
    urlDatabase[shortURL].longURL = longURL;
    return res.redirect(`/urls/${shortURL}`)
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
    return res.render("urls_show", templateVars);
  }
  return res.status(401).send("<h1>Sorry!</h1> <p>This TinyURL does not belong to you.<p>")
});

//delete button function
app.post("/urls/:shortURL/delete", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    delete urlDatabase[req.params.shortURL];
  };
  return res.redirect("/urls")
});

///////// U/:SHORTURL /////////

//redirect to longURL
app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const fullURL = urlDatabase[req.params.shortURL].longURL;
    return res.redirect(fullURL);
  }
});

///////// /REGISTER /////////

app.get("/register", (req, res) => {
  let templateVars = {
    user: null
  };
  return res.render("urls_registration", templateVars)
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
  const userID = addNewUser(email, password, userDb)
  res.cookie("user_id", userID);
  return res.redirect("/urls");
});


////////// /LOGIN ///////////

app.get("/login", (req, res) => {
  let templateVars = {
    user: userDb[req.cookies["user_id"]]
  };
  return res.render("urls_login", templateVars)
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
  res.clearCookie("user_id", req.body.userID);
  return res.redirect('/urls');
});
