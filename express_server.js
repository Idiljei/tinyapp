const express = require("express");
const app = express();
const PORT = 3000;
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const { findUserbyEmail } = require("./helpers");
const { generateRandomStringeid } = require("./helpers");
const { validateUniqueEmail } = require("./helpers");
const cookieSession = require("cookie-session");
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: "session",
    keys: ["key1"],
    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" },
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const urlsForUser = (id) => {
  let filteredDatabase = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      filteredDatabase[shortURL] = urlDatabase[shortURL];
    }
  }
  return filteredDatabase;
};

//Create new URL
app.post("/urls", (req, res) => {
  let shortURL = generateRandomStringeid(); 
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id,
  }; 
  return res.redirect(`/urls/${shortURL}`); 
});

//View all URLS
app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  let view = "urls_index";
  if (!userID) {
    view = "urls_error";
  }
  const templateVars = {
    urls: urlsForUser(userID),
    user: users[userID],
  };

  return res.render(view, templateVars);
});

// Add new URL
app.get("/urls/new", (req, res) => {
  const loggedIn = req.session.user_id;

  if (!loggedIn) {
    res.redirect("/login");
    return;
  }
  const templateVars = {
    user: users[req.session.user_id],
  };
  res.render("urls_new", templateVars);
});

// Login pager render
app.get("/login", (req, res) => {
  const templateVars = { user: null }; 
  res.render("login", templateVars);
});

//login
app.post("/login", function (req, res) {
  const email = req.body.email;
  const password = req.body.password;
  const user = findUserbyEmail(email, users);

  if (!user) {
    res.status(403).send("Email cannot be found");
    return;
  }
  if (bcrypt.compareSync(password, user.password)) {
    req.session.user_id = user.id;
    res.redirect("/urls");
  } else {
    return res.status(403).send("Password incorrect");
  }
});

// Register page render
app.get("/register", (req, res) => {
  const templateVars = { user: null }; 
  res.render("urls_register", templateVars);
});

// register new account
app.post("/register", function (req, res) {
  const id = generateRandomStringeid();
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (!email || !password) {
    res.send("404");
    return;
  }
  validateUniqueEmail(email, users, res);

  users[id] = { id, email, password: hashedPassword };
  req.session.user_id = id;
  res.redirect("/urls");
});

//logout page
app.post("/logout", function (req, res) {
  req.session = null;

  return res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL; //redirecting to go to Long URL website
  return res.redirect(longURL);
});

// Get single URL
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;

  const userID = req.session.user_id;
  let view = "urls_show";
  if (!userID) {
    view = "urls_error";
  }
  const urlBelongtoUser =
    urlDatabase[shortURL] && urlDatabase[shortURL].userID === userID;
  if (!urlBelongtoUser) {
    view = "urls_notuser";
  }

  const templateVars = {
    shortURL,
    longURL,
    user: users[req.session.user_id],
  };
  return res.render(view, templateVars);
});

// Edit exisitng URL
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL; 
  const longURL = req.body.longURL;
  urlDatabase[shortURL].longURL = longURL;
  return res.redirect("/urls");
});

// Deleting the URL
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL]; 
  return res.redirect("/urls"); 
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
