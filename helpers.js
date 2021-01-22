const findUserbyEmail = (email, database) => {
  for (let user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
};

//Generate UserID
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

const validateUniqueEmail = (email, database, res) => {
  for (let user in database) {
    if (database[user].email === email) {
      res.status(400).send("Email already exists");
      return;
    }
  }
};

module.exports = {
  findUserbyEmail,
  generateRandomStringeid,
  validateUniqueEmail,
};
