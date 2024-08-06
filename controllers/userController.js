const User = require("../models/user.js");
const createToken = require("../utils/Token.js");
const { generateHash, comparePassword } = require("../utils/hashing.js");

async function createUser(req, res) {
  try {
    const isUserExists = await User.findOne({ email: req.body.email });
    if (isUserExists)
      return res.status(409).json({ message: "user already exists" });
    const hash = await generateHash(req.body.password);
    let user = new User({ ...req.body, password: hash });
    await user.save();
    res.status(201).json({ message: "success", data: user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "internal server error", error: error });
  }
}

async function userLogin(req, res) {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email });
    if (user) {
      if (await comparePassword(password, user.password)) {
        const token = createToken(user._id);
        res.status(201).json({ message: "Logged in successfull", token:token });
      } else res.status(409).json({ message: "wrong password" });
    } else res.status(409).json({ message: "user does not exists" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "internal server error" });
  }
}

module.exports = { createUser, userLogin };
