const User = require("../models/user.js");
const createToken = require("../utils/Token.js");
const { generateHash, comparePassword } = require("../utils/hashing.js");

async function createUser(userDetails) {
  try {
    const isUserExists = await User.findOne({ email: userDetails.email });
    if (isUserExists)
      return {
        status: 400,
        message: "user already exists with this email try to login",
      };
    const hash = await generateHash(userDetails.password);
    const newUser = new User({ ...userDetails, password: hash });
    const savedUser = await newUser.save();
    const token = createToken(savedUser._id);
    return { status: 200, message: "Signup successful", token };
  } catch (error) {
    throw error;
  }
}

async function userLogin(userDetails) {
  try {
    const user = await User.findOne({ email: userDetails.email });
    if (user) {
      if (await comparePassword(user.password, userDetails.password)) {
        const token = createToken(user._id);
        return { status: 200, message: "Login successful", token };
      } else return { status: 409, message: "wrong password" };
    } else return { status: 400, message: "Email does not exists" };
  } catch (error) {
    throw error;
  }
}

module.exports = { createUser, userLogin };
