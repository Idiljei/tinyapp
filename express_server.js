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

app.set("view engine", "ejs");

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  let shortURL = generateRandomStringeid(); //assign the function to a new variable
  urlDatabase[shortURL] = req["body"]["longURL"]; // To add a new key to urlDatabase use [] since shortURL is dynamic- longURL is static
  res.redirect(`/urls/${shortURL}`); //redirects to page with short url
  console.log(urlDatabase);
});

app.get("/", (req, res) => {
  res.send("Hello!"); //sends back "hello" after request made to localhost:3000
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase); //the info in urlDatabase object in json format
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n"); //html string sent to browser after request made
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"] }; //assigned urlDatabase as object in a variable
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { username: req.cookies["username"] };
  res.render("urls_new", templateVars);
});

app.post("/logout", function (req, res) {
  res.clearCookie("username");
  res.redirect("/urls");
});

app.post("/login", function (req, res) {
  const username = req.body.username;

  // Cookies that have not been signed
  console.log("Cookies: ", req.cookies);
  res.cookie("username", username); //stores the value of username inputted in browser
  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;

  console.log(urlDatabase[shortURL]);
  res.redirect(urlDatabase[shortURL]);
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL; // Lighthouselabs;
  const longURL = urlDatabase[shortURL];

  const templateVars = { shortURL, longURL, username: req.cookies["username"] };
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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
