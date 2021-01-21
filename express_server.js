// know what you are setting on login and register (expected key value pair)
// know the diff btwn req.params and req.body
// template variable- access to the varaibles on the ejs site

const express = require("express");
const app = express();
const PORT = 3000; // default port 8080

const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

//function to generate random alphanumeric url
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

//helper function
const validateUniqueEmail = (email, database, res) => {
    for (let user in database) {
    if (database[user].email === email) {
      res.status(400).send("Email already exists");
      return;
    }
  }
};

app.set("view engine", "ejs");

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
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
console.log(users)
//Assign alphanumeric key to urldatabase
app.post("/urls", (req, res) => {
  let shortURL = generateRandomStringeid(); //assign the function to a new variable
  urlDatabase[shortURL] = req["body"]["longURL"]; // To add a new key to urlDatabase use [] since shortURL is dynamic- longURL is static
  res.redirect(`/urls/${shortURL}`); //redirects to page with short url
});

app.get("/", (req, res) => {
  res.send("Hello!"); //sends back "hello" after request made to localhost:3000
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase); //the info in urlDatabase object in json format
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]],
  }; //assigned urlDatabase as object in a variable
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { username: req.cookies["username"], user: null };

  res.render("urls_new", templateVars);
});

//login page
app.get("/login", (req, res) => {
  const templateVars = { user: null }; // giving comp ok to carry on bc we don't have user yet
  res.render("login", templateVars);
});

//login submitter
app.post("/login", function (req, res) {
  const username = req.body.username;

  // Cookies that have not been signed
  res.cookie("user_id", username); //stores the value of username inputted in browser
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
 console.log(users)
  res.cookie("user_id", id);
  res.redirect("/urls");
});

//logout submitter
app.post("/logout", function (req, res) {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;

  res.redirect(urlDatabase[shortURL]);
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
