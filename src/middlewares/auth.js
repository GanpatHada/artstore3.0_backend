const User = require("../models/user");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asynchandler");
const jwt = require("jsonwebtoken");

const verifyJwt = asyncHandler(async (req, _, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "").trim();

  if (!token) {
    throw new ApiError(401, "Unauthorized access: token not found", "MISSED_TOKEN");
  }

  try {
    const decodedJwt = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedJwt._id).lean();
    if (!user) {
      throw new ApiError(401, "User does not exist", "USER_NOT_FOUND");
    }

    req._id = user._id;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new ApiError(401, "Access token expired", "EXPIRED_TOKEN");
    } else {
      throw new ApiError(401, "Invalid access token", "INVALID_TOKEN");
    }
  }
});

module.exports = verifyJwt;
