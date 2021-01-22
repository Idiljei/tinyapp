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

// GET & POST REQUESTS

//Assign alphanumeric key to urldatabase
app.post("/urls", (req, res) => {
  let shortURL = generateRandomStringeid(); //assign the function to a new variable
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id,
  }; // To add a new key to urlDatabase use [] since shortURL is dynamic- longURL is static
  res.redirect(`/urls/${shortURL}`); //redirects to page with short url
});

app.get("/urls", (req, res) => {
  const userID = req.session.user_id;

  if (!userID) {
    res.redirect("/login");
  }
  const templateVars = {
    urls: urlsForUser(userID),
    user: users[userID],
  };

  res.render("urls_index", templateVars);
});

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

//login page
app.get("/login", (req, res) => {
  const templateVars = { user: null }; // giving comp ok to carry on bc we don't have user yet
  res.render("login", templateVars);
});

//login submitter
app.post("/login", function (req, res) {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const user = findUserbyEmail(email, users);

  if (!user) {
    res.status(403).send("Email cannot be found");
    return;
  }
  if (bcrypt.compareSync(password, hashedPassword)) {
    req.session.user_id = user.id;
    res.redirect("/urls");
  } else {
    res.status(403).send("Password incorrect");
  }
});

// register page
app.get("/register", (req, res) => {
  const templateVars = { user: null }; // giving comp ok to carry on bc we don't have user yet
  res.render("urls_register", templateVars);
});

// register submitter
app.post("/register", function (req, res) {
  const id = generateRandomStringeid();
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    res.send("404");
    return;
  }
  validateUniqueEmail(email, users, res);

  users[id] = { id, email, password };
  req.session.user_id = id;
  res.redirect("/urls");
});

//logout submitter
app.post("/logout", function (req, res) {
  req.session = null;

  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL; //redirecting to go to Long URL website
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL; // Lighthouselabs;
  const longURL = urlDatabase[shortURL];

  const templateVars = {
    shortURL,
    longURL,
    user: users[req.session.user_id],
  }; //user = whole users object at the users.id to see if it matches
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL; //returns the generated short url
  const longURL = req.body.longURL;
  urlDatabase[shortURL].longURL = longURL;
  console.log( urlDatabase[shortURL].longURL)
  res.redirect("/urls");
});

// Deleting the URL generated on the form
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL]; //use delete operator to delete
  res.redirect("/urls"); //redirecting back to the main page after delete button pressed
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
