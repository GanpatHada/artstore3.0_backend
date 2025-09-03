const jwt = require("jsonwebtoken");

const generateAccessToken = (id) => {
  return jwt.sign(
    { _id: id },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};


const generateRefreshToken = (id) => {
  return jwt.sign(
    { _id: id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY } 
  );
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
};
