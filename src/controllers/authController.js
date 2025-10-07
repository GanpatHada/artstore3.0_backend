const { cookieOptions } = require("../helpers/auth.helpers");
const Seller = require("../models/seller");
const User = require("../models/user");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asynchandler");
const jwt = require("jsonwebtoken");

const models = { user: User, seller: Seller };

// ---------------- SIGNUP ----------------
const signup = asyncHandler(async (req, res) => {
  const { mode } = req.params;
  const { fullName, email, password, phone, shopName, gstNumber } = req.body;

  const Model = models[mode];
  if (!Model) {
    throw new ApiError(400, "Invalid mode, must be 'user' or 'seller'", "INVALID_MODE");
  }

  // Check if email already exists
  const isEmailExists = await Model.findOne({ email });
  if (isEmailExists) {
    throw new ApiError(409, `${mode} with this email already exists`, "EMAIL_ALREADY_EXISTS");
  }

  // Check if phone already exists
  const isPhoneExists = await Model.findOne({ phone });
  if (isPhoneExists) {
    throw new ApiError(409, `${mode} with this phone already exists`, "PHONE_ALREADY_EXISTS");
  }

  // Create account
  const newAccount = await Model.create({
    email,
    password,
    fullName,
    phone,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, { email: newAccount.email }, `${mode} registered successfully`));
});

// ---------------- LOGIN ----------------
const login = asyncHandler(async (req, res) => {
  const { mode } = req.params;
  const { emailOrPhone, password } = req.body;

  const Model = models[mode];
  if (!Model) {
    throw new ApiError(400, "Invalid mode, must be 'user' or 'seller'", "INVALID_MODE");
  }

  // Find by email OR phone
  const account = await Model.findOne({
    $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
  });

  if (!account) {
    throw new ApiError(404, "Account not found with this email or phone", "ACCOUNT_NOT_FOUND");
  }

  // Check password
  const validPassword = await account.isPasswordCorrect(password);
  if (!validPassword) {
    throw new ApiError(401, "Incorrect password, please try again", "INVALID_PASSWORD");
  }

  const accessToken = await account.generateAccessToken();
  const refreshToken = await account.generateRefreshToken();

  account.refreshToken = refreshToken;
  await account.save({ validateBeforeSave: false });

  const safeAccount = account.toObject();
  delete safeAccount.password;
  delete safeAccount.refreshToken;
  delete safeAccount.createdAt;
  delete safeAccount.updatedAt;
  delete safeAccount.__v;

  return res
    .status(200)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        {
          accessToken,
          [mode]: safeAccount,
        },
        `${mode} logged in successfully`
      )
    );
});



//-------------refresh access token-------------


const refreshAccessToken = asyncHandler(async (req, res) => {
  const { mode } = req.params; // "user" or "seller"
  const oldRefreshToken = req.cookies.refreshToken;

  if (!oldRefreshToken) {
    throw new ApiError(401, "Unauthorized request", "MISSED_REFRESH_TOKEN");
  }

  // Verify refresh token
  let decodedToken;
  try {
    decodedToken = jwt.verify(oldRefreshToken, process.env.REFRESH_TOKEN_SECRET);
  } catch (error) {
    const isExpired = error.name === "TokenExpiredError";
    throw new ApiError(
      401,
      isExpired ? "Refresh token expired" : "Invalid refresh token",
      isExpired ? "EXPIRED_REFRESH_TOKEN" : "INVALID_REFRESH_TOKEN"
    );
  }

  let account;

  switch (mode) {
    case "user":
      account = await User.findById(decodedToken._id);
      if (!account) throw new ApiError(401, "User not found", "USER_NOT_FOUND");
      break;

    case "seller":
      account = await Seller.findById(decodedToken._id);
      if (!account) throw new ApiError(401, "Seller not found", "SELLER_NOT_FOUND");
      break;

    default:
      throw new ApiError(400, "Invalid mode", "INVALID_MODE");
  }


  if (oldRefreshToken !== account.refreshToken) {
    throw new ApiError(401, "Refresh token mismatch", "INVALID_REFRESH_TOKEN");
  }


  const accessToken = await account.generateAccessToken();
  const newRefreshToken = await account.generateRefreshToken();


  account.refreshToken = newRefreshToken;
  await account.save();


  return res
    .status(200)
    .cookie("refreshToken", newRefreshToken, cookieOptions)
    .json(new ApiResponse(200, accessToken, "Access token refreshed"));
});

module.exports = { signup, login, refreshAccessToken};
