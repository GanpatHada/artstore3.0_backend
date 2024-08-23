const jwt = require("jsonwebtoken");
require("dotenv").config();
const MY_SECRET = process.env.SECRET_KEY;
function createToken(userId) {
  const token = jwt.sign({ userId }, MY_SECRET);
  return token;
}

function verifyToken(token) {
  try {
    const decodedToken = jwt.verify(token, MY_SECRET);
    return decodedToken.userId
  } catch (error) {
    throw error;
  }
}
module.exports = {createToken,verifyToken};
