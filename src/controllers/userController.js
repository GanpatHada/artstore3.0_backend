const asyncHandler = require("../utils/asynchandler.js");
const ApiError = require("../utils/ApiError.js");
const ApiResponse = require("../utils/ApiResponse.js");
const User = require("../models/user.js");
const uploadOnCloudinary = require("../utils/cloudinary.js");

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const refreshToken = await user.generateRefreshToken();
    const accessToken = await user.generateAccessToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating token");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, password, phone } = req.body;

  //check empty and missing fields
  if (
    [fullName, email, password, phone].some(
      (field) => field === undefined || field.trim().length === 0
    )
  ) {
    throw new ApiError(400, "required fields either empty or missing");
  }

  //user already exists
  const isAccountExistsAlready = await User.findOne({ email });
  if (isAccountExistsAlready) {
    throw new ApiError(409, "user with this email already exists");
  }

  //save profileImage
  const profileImagePath = req.file?.path;
  let profileImageUrl;
  if (profileImagePath) {
    profileImageUrl = await uploadOnCloudinary(profileImagePath);
  }
  const user = await User.create({
    email,
    password,
    fullName,
    profileImage: profileImageUrl || null,
    phone,
  });
  const createduser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createduser) {
    throw new ApiError(
      500,
      "Something went wrong while creating user Account"
    );
  }
  return res
    .status(201)
    .json(
      new ApiResponse(200, createduser, "user registered successfully")
    );
});

const loginUser = asyncHandler(async (req, res) => {
  //check for empty and missing fields
  const { email, password } = req.body;
  if (
    [email, password].some(
      (field) => field === undefined || field.trim().length === 0
    )
  ) {
    throw new ApiError(400, "required fields either empty or missing");
  }
  const userFound = await User.findOne({ email });
  if (!userFound) {
    throw new ApiError(409, "account does not exist with this email");
  }
  const validPassword = await userFound.isPasswordCorrect(password);
  if (!validPassword) {
    throw new ApiError(409, "Incorrect Password");
  }
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    userFound._id
  );
  const loggedInuser=await User.findById(userFound._id).select("-password -refreshToken")

  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInuser,
          accessToken,
          refreshToken,
        },
        "user logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  const loggedInuser = await User.findByIdAndUpdate(
    req._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );
  if(!loggedInuser)
  {
    throw new ApiError(401,"user not found")
  }
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res.status(200)
  .clearCookie("accessToken",options)
  .clearCookie("refreshToken",options)
  .json(new ApiResponse(200,{},"user logged out successfully"))
});

module.exports = { registerUser, loginUser, logoutUser };

