const User = require("../models/user");

async function generateAccessTokenHelper(userId){
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    return accessToken;
  } catch (error) {
    throw error;
  }
};

async function generateRefreshTokenHelper(userId){
  try {
    const user = await User.findById(userId);
    const refreshToken = await user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return refreshToken;
  } catch (error) {
    throw error;
  }
};

async function generateAccessAndRefreshToken(userId){
  try {
    const refreshToken = await generateRefreshTokenHelper(userId);
    const accessToken = await generateAccessTokenHelper(userId);
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating token");
  }
};

module.exports={generateAccessAndRefreshToken,generateAccessTokenHelper,generateRefreshTokenHelper}