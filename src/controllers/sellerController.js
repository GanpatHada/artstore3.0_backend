const asyncHandler = require("../utils/asynchandler.js");
const ApiError = require("../utils/ApiError.js");
const ApiResponse = require("../utils/ApiResponse.js");
const Seller = require("../models/seller.js");
const uploadOnCloudinary = require("../utils/cloudinary.js");
const { cookieOptions } = require("../helpers/auth.helpers.js");

const generateAccessToken=async(userId)=>{
  try {
    const user = await Seller.findById(userId);
    const accessToken = await user.generateAccessToken();
    return accessToken;
  } catch (error) {
    throw new Error('Something went wrong while generating access Token');
  }
}

const generateRefreshToken=async(userId)=>{
  try {
    const user = await Seller.findById(userId);
    const refreshToken = await user.generateRefreshToken();
    user.refreshToken  = refreshToken;
    await user.save({ validateBeforeSave: false });
    return refreshToken;
  } catch (error) {
    throw new Error('Something went wrong while generating refresh Token');
  }
}

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const refreshToken = await generateRefreshToken(userId);
    const accessToken  =  await generateAccessToken(userId);
    return { accessToken, refreshToken };
  } catch (error) {
    throw error
  }
};

const registerSeller = asyncHandler(async (req, res) => {
  const { fullName, email, password, phone } = req.body;

  //seller already exists
  const isAccountExistsAlready = await Seller.findOne({ email });
  if (isAccountExistsAlready) {
    throw new ApiError(409, "seller with this email already exists");
  }

  const seller = await Seller.create({email,password,fullName,phone});
  const createdSeller = await Seller.findById(seller._id).select("-password -refreshToken");
  if (!createdSeller) 
    throw new ApiError(500,"Something went wrong while creating seller Account");
  return res.status(201).json(new ApiResponse(200, createdSeller, "Seller registered successfully"));
});



const loginSeller = asyncHandler(async (req, res) => {
  const{email,password}=req.body;
  
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
  const loggedInSeller=await Seller.findById(sellerFound._id).select(
    "-password -refreshToken -_id -createdAt -updatedAt -__v"
  );


  return res
  .status(200).cookie("refreshToken", refreshToken, cookieOptions)
  .json(
    new ApiResponse(200,
      {
        seller: loggedInSeller,
        accessToken,
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
