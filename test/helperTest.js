const { assert } = require("chai");
const { findUserbyEmail } = require("../helpers.js");

const testUsers = {
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

describe("getUserByEmail", function () {
  it("should return a user with valid email", function () {
    const user = findUserbyEmail("user@example.com", testUsers);
    const expectedOutput = {
      id: "userRandomID",
      email: "user@example.com",
      password: "purple-monkey-dinosaur",
    };

    assert(JSON.stringify(user) === JSON.stringify(expectedOutput));
  });

  it("should return a user with valid email", function () {
    const user = findUserbyEmail("user2@example.com", testUsers);
    const expectedOutput = {
      id: "user2RandomID",
      email: "user2@example.com",
      password: "dishwasher-funk",
    };
    assert(JSON.stringify(user) === JSON.stringify(expectedOutput));
  });

  it("should return undefined", function () {
    const user = findUserbyEmail("idontexist@example.com", testUsers);
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput);
  });
});
