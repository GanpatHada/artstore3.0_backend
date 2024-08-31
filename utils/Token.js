const jwt = require("jsonwebtoken");
require("dotenv").config();
const MY_SECRET = process.env.SECRET_KEY;
function createToken(userId) {
  const token = jwt.sign({ userId }, MY_SECRET);
  return token;
}

function verifyToken(token) {
  try {
    const decodedTokenData = jwt.verify(token, MY_SECRET);
    return {message:"user authenticated",data:decodedTokenData.userId,success:true}
  } catch (error) {
    return {message:"user not found",success:false}
  }
}
module.exports = {createToken,verifyToken};
