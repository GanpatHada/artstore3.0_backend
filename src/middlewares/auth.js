const jwt = require("jsonwebtoken");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asynchandler");
const User = require("../models/user");
const Seller = require("../models/seller");

const verifyToken = async (req) => {
  const token = req.header("Authorization")?.replace("Bearer ", "").trim();
  if (!token)
    throw new ApiError(
      401,
      "Unauthorized access: token not found",
      "MISSED_TOKEN",
    );

  try {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new ApiError(401, "Access token expired", "EXPIRED_TOKEN");
    }
    throw new ApiError(401, "Invalid access token", "INVALID_TOKEN");
  }
};

const verifyUserJwt = asyncHandler(async (req, _, next) => {
  const decoded = await verifyToken(req);
  const user = await User.findById(decoded._id);
  if (!user) throw new ApiError(401, "User does not exist", "USER_NOT_FOUND");

  req.user = user;
  next();
});

const verifySellerJwt = asyncHandler(async (req, _, next) => {
  const decoded = await verifyToken(req);
  const seller = await Seller.findById(decoded._id);
  if (!seller)
    throw new ApiError(401, "Seller does not exist", "SELLER_NOT_FOUND");

  req.seller = seller;
  next();
});

module.exports = { verifyUserJwt, verifySellerJwt };
