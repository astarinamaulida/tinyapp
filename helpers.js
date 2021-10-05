const bcrypt = require('bcrypt');

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

// To check if there is user with this email
const getUserByEmail = function(email, users) {
  for (const userID in users) {
    const user = users[userID];
    console.log(email, user);
    if (email === user.email) {
      return user;
    }
  }
  return undefined;
};

// Create random combination for userID and shortURL
const generateRandomString = function() {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// To add new user
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

// To filter the urls by certain user
const urlsForUser = function(id) {
  const filterId = {};
  const keys = Object.keys(urlDatabase);

  for (const shortURL of keys) {
    const url = urlDatabase[shortURL];
    if (url.userID === id) {
      filterId[shortURL] = url;
    }
    console.log('id:',id);
  }
  return filterId;
};

module.exports = { userDb, urlDatabase, getUserByEmail, generateRandomString, addNewUser, urlsForUser };