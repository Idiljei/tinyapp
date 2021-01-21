const express = require("express");
const app = express();
const PORT = 3000;

const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" },
};

//HELPER FUNCTIONS

function generateRandomStringeid(length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
console.log(generateRandomStringeid());

const validateUniqueEmail = (email, database, res) => {
  for (let user in database) {
    if (database[user].email === email) {
      res.status(400).send("Email already exists");
      return;
    }
  }
};

const findUserbyEmail = (email, database) => {
  for (let user in database) {
    if (database[user].email === email) {
      // means we found user
      return database[user];
    }
  }
};

//returns the url owned by the userID
const urlsForUser = (id) => {
  let filteredDatabase = {};
  for (let shortURL in urlDatabase) {

    if (urlDatabase[shortURL].userID === id) {
      filteredDatabase[shortURL] = urlDatabase[shortURL];
    }
  }
  return filteredDatabase;
};

// STORED DATA

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
console.log(users);

// GET & POST REQUESTS

//Assign alphanumeric key to urldatabase
app.post("/urls", (req, res) => {
  let shortURL = generateRandomStringeid(); //assign the function to a new variable
  urlDatabase[shortURL] = {longURL: req.body.longURL, userID: req.cookies["user_id"]}; // To add a new key to urlDatabase use [] since shortURL is dynamic- longURL is static
  res.redirect(`/urls/${shortURL}`); //redirects to page with short url
});

app.get("/urls", (req, res) => {
  const userID = req.cookies["user_id"];

  if (!userID) {
    res.send("Please Login");
  }
  const templateVars = {
    urls: urlsForUser(userID),
    user: users[userID],
  };

  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const loggedIn = req.cookies["user_id"]; //checking if the user exists

  if (!loggedIn) {
    res.redirect("/login");
    return;
  }
  const templateVars = {
    user: users[req.cookies["user_id"]],
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
  const user = findUserbyEmail(email, users);

  if (!user) {
    res.status(403).send("Email cannot be found");
    return;
  }
  if (user.password !== password) {
    res.status(403).send("Password incorrect");
    return;
  }

  res.cookie("user_id", user.id); //stores the value of username inputted in browser
  res.redirect("/urls");
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
  res.cookie("user_id", id);
  res.redirect("/urls");
});

//logout submitter
app.post("/logout", function (req, res) {
  res.clearCookie("user_id");
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
    user: users[req.cookies["user_id"]],
  }; //user = whole users object at the users.id to see if it matches
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL; //returns the generated short url
  const longURL = req.body.longURL;

  urlDatabase[shortURL] = longURL;
  res.redirect("/urls");
});

// Deleting the URL generated on the form
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL]; //use delete operator to delete
  res.redirect("/urls"); //redirecting back to the main page after delete button pressed
});

app.get("*", (req, res) => {
  res.render("404");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
