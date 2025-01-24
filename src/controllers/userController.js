const asyncHandler = require("../utils/asynchandler.js");
const ApiError = require("../utils/ApiError.js");
const ApiResponse = require("../utils/ApiResponse.js");
const User = require("../models/user.js");
const uploadOnCloudinary = require("../utils/cloudinary.js");
const Product = require("../models/product.js");
const jwt=require("jsonwebtoken");
const { none } = require("../middlewares/multer.js");

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

//auth

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, password, phone } = req.body;

  //check empty and missing fields
  if (
    [fullName, email, password, phone].some(
      (field) =>field?.trim().length === 0
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
    throw new ApiError(500, "Something went wrong while creating user Account");
  }
  return res
    .status(201)
    .json(new ApiResponse(200, createduser, "user registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  //check for empty and missing fields
  const { email, password } = req.body;
  console.log(email, password);
  if (
    [email, password].some(
      (field) =>field?.trim().length === 0
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
  const loggedInuser = await User.findById(userFound._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
    maxAge: 30 * 24 * 60 * 60 * 1000,
    sameSite:'None',
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          accessToken,
          refreshToken,
          loggedInuser
        },
        "user logged in successfully"
      )
    );
});

const refreshAccessToken=asyncHandler(async(req,res)=>{
  const incommingRefreshToken=req.cookies.refreshToken || req.body.refreshToken;
  if(!incommingRefreshToken)
    throw new ApiError(401,"unauthorized request");
  const decodedToken=jwt.verify(incommingRefreshToken,process.env.REFRESH_TOKEN_SECRET);
  const userId=decodedToken._id;
  const user=await User.findById(userId);
  if(!user)
    throw new ApiError(401,"Invalid refresh token")
  if(incommingRefreshToken!==user?.refreshToken)
    throw new ApiError(401,"Refresh Token is expired");

  const options={
    httpOnly:true,
    secure:true,
    maxAge: 30 * 24 * 60 * 60 * 1000,
    sameSite:'None',
  }

  const{refreshToken,accessToken}=await generateAccessAndRefreshToken(user._id);
  return res.status(200)
  .cookie("accessToken",accessToken,options)
  .cookie("refreshToken",refreshToken,options)
  .json(new ApiResponse(200,{refreshToken,accessToken},"Access token refreshed"))


})

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
  if (!loggedInuser) {
    throw new ApiError(401, "user not found");
  }
  const options = {
    httpOnly: true,
    secure: true,
    maxAge: 30 * 24 * 60 * 60 * 1000,
    sameSite:'None',
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "user logged out successfully"));
});

//details

const getLoggedInUserDetails=asyncHandler(async(req,res)=>{
   const userId=req._id;
   const user=await User.findById(userId).select("-password -refreshToken");
   if(!user)
   {
    throw new ApiError(400,"user not found")
   }
   return res.status(200).json(new ApiResponse(200,{user,userRole:'USER'},"user details fetched successfully"))
})


//cart

const addToCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const userId = req._id;
  if (!productId || productId.trim().length === 0)
    throw new ApiError(400, "ProductId not given");
  const product = Product.findById(productId);
  if (!product) {
    throw new ApiError(400, "Product not found");
  }
  await User.findByIdAndUpdate(
    userId,
    { $addToSet: { cart: productId } },

    {
      new: true,
    }
  )
  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        productId,
        "Product has been added to cart"
      )
    );
});

const deleteFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const userId = req._id;
  if (!productId || productId.trim().length === 0)
    throw new ApiError(400, "ProductId not given");

  const product = Product.findById(productId);
  if (!product) {
    throw new ApiError(400, "Product not found");
  }

  await User.findByIdAndUpdate(
    userId,
    { $pull: { cart: productId } },

    {
      new: true,
    }
  )
  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        productId,
        "Product has been removed from cart"
      )
    );
});



//wishlist

const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const userId = req._id;
  if (!productId || productId.trim().length === 0)
    throw new ApiError(400, "ProductId not given");
  const product = Product.findById(productId);
  if (!product) {
    throw new ApiError(400, "Product not found");
  }
  await User.findByIdAndUpdate(
    userId,
    { $addToSet: { wishlist: productId } },

    {
      new: true,
    }
  ).populate("wishlist");
  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        productId,
        "Product has been added to Wishlist"
      )
    );
});

const deleteFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const userId = req._id;
  if (!productId || productId.trim().length === 0)
    throw new ApiError(400, "ProductId not given");

  const product = Product.findById(productId);
  if (!product) {
    throw new ApiError(400, "Product not found");
  }

  await User.findByIdAndUpdate(
    userId,
    { $pull: { wishlist: productId } },

    {
      new: true,
    }
  ).populate("wishlist");
  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        productId,
        "Product has been removed from wishlist"
      )
    );
});

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getLoggedInUserDetails,
  addToCart,
  deleteFromCart,
  addToWishlist,
  deleteFromWishlist
};
