const asyncHandler = require("../utils/asynchandler.js");
const ApiError = require("../utils/ApiError.js");
const ApiResponse = require("../utils/ApiResponse.js");
const Seller = require("../models/seller.js");
const uploadOnCloudinary = require("../utils/cloudinary.js");

const generateAccessAndRefreshToken = async (sellerId) => {
  try {
    const seller = await Seller.findById(sellerId);
    const refreshToken = await seller.generateRefreshToken();
    const accessToken = await seller.generateAccessToken();
    seller.refreshToken = refreshToken;
    await seller.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating token");
  }
};

const registerSeller = asyncHandler(async (req, res) => {
  const { fullName, email, password, phone } = req.body;

  //check empty and missing fields
  if (
    [fullName, email, password, phone].some(
      (field) => field === undefined || field.trim().length === 0
    )
  ) {
    throw new ApiError(400, "required fields either empty or missing");
  }

  //seller already exists
  const isAccountExistsAlready = await Seller.findOne({ email });
  if (isAccountExistsAlready) {
    throw new ApiError(409, "seller with this email already exists");
  }

  //save profileImage
  const profileImagePath = req.file?.path;
  let profileImageUrl;
  if (profileImagePath) {
    profileImageUrl = await uploadOnCloudinary(profileImagePath);
  }
  const seller = await Seller.create({
    email,
    password,
    fullName,
    profileImage: profileImageUrl || null,
    phone,
  });
  const createdSeller = await Seller.findById(seller._id).select(
    "-password -refreshToken"
  );
  if (!createdSeller) {
    throw new ApiError(
      500,
      "Something went wrong while creating seller Account"
    );
  }
  return res
    .status(201)
    .json(
      new ApiResponse(200, createdSeller, "Seller registered successfully")
    );
});

const loginSeller = asyncHandler(async (req, res) => {
  //check for empty and missing fields
  const { email, password } = req.body;
  if (
    [email, password].some(
      (field) => field === undefined || field.trim().length === 0
    )
  ) {
    throw new ApiError(400, "required fields either empty or missing");
  }
  const sellerFound = await Seller.findOne({ email });
  if (!sellerFound) {
    throw new ApiError(409, "account does not exist with this email");
  }
  const validPassword = await sellerFound.isPasswordCorrect(password);
  if (!validPassword) {
    throw new ApiError(409, "Incorrect Password");
  }
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    sellerFound._id
  );
  const loggedInSeller=await Seller.findById(sellerFound._id).select("-password -refreshToken")

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
          seller: loggedInSeller,
          accessToken,
          refreshToken,
        },
        "seller logged in successfully"
      )
    );
});

const logoutSeller = asyncHandler(async (req, res) => {
  const loggedInSeller = await Seller.findByIdAndUpdate(
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
  if(!loggedInSeller)
  {
    throw new ApiError(401,"seller not found")
  }
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res.status(200)
  .clearCookie("accessToken",options)
  .clearCookie("refreshToken",options)
  .json(new ApiResponse(200,{},"seller logged out successfully"))
});

module.exports = { registerSeller, loginSeller, logoutSeller };
