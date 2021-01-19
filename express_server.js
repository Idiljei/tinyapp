const express = require("express");
const app = express();
const PORT = 3000; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

//function to generate random alphanumeric url 
  function generateRandomStringeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < 6; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }
 console.log(generateRandomStringeid());
 

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",

};

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  let shortURL = generateRandomStringeid() //assign the function to a new variable
  urlDatabase[shortURL] = req["body"]["longURL"] // To add a new key to urlDatabase use [] since shortURL is dynamic- longURL is static
  res.redirect(`/urls/${shortURL}`);         // Respond with 'Ok' (we will replace this)
  console.log(urlDatabase)
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase)
})
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase }; //assigned urlDatabase as object in a variable 
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL //returns the generated short url/Lighthouselabs 
  console.log(urlDatabase[shortURL])
  res.redirect(urlDatabase[shortURL])
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: req.params.longURL};
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
