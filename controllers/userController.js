const User = require("../models/user.js");
const { generateHash, comparePassword } = require("../utils/hashing.js");
const { createToken } = require("../utils/Token.js");

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

async function addAddress(userId, address, markDefault) {
  try {
    const user = await User.findById(userId);
    if (!user) return { status: 401, message: "user not found" };
    if (markDefault) user.addresses = [address, ...user.addresses];
    else user.addresses = [...user.addresses, address];
    await user.save();
    return { status: 200, message: "address added successfuly" };
  } catch (error) {
    throw error;
  }
}

async function getUser(userId){
  try {
    const user=await User.findById(userId).select('-password -_id').exec();
    if(!user)
      return {status:401,message:"user not found",data:null}
    return {status:200,message:"user found",data:user}
  } catch (error) {
    throw error;
  }

}

module.exports = { createUser, userLogin, addAddress,getUser };
