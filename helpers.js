const bcrypt = require('bcrypt');

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
};

const getUserByEmail = function(email, users) {
  for (let userID in users) {
    const user = users[userID];
    if (email === user.email) {
      return user;
    }
  }
  return undefined;
};

const generateRandomString = function() {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const addNewUser = function(email, password, users) {
  const hashPassword = bcrypt.hashSync(password, 10);
  let userID = generateRandomString();
  users[userID] = {
    id: userID,
    email,
    password: hashPassword
  };
  return userID;
};

const urlsForUser = function(id) {
  const filterId = {};
  const keys = Object.keys(urlDatabase);

  for (const shortURL of keys) {
    const url = urlDatabase[shortURL];
    if (url.userID === id) {
      filterId[shortURL] = url;
    }
  }
  return filterId;
};

module.exports = { urlDatabase, userDb, getUserByEmail, generateRandomString, addNewUser, urlsForUser };