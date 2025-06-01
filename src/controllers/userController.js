const asyncHandler = require("../utils/asynchandler.js");
const ApiError = require("../utils/ApiError.js");
const ApiResponse = require("../utils/ApiResponse.js");
const User = require("../models/user.js");
const Seller = require("../models/seller.js");
const uploadOnCloudinary = require("../utils/cloudinary.js");
const Product = require("../models/product.js");
const jwt = require("jsonwebtoken");
const {
  extractRequiredAddressFields,
  checkRequiredFieldsMissingOrEmpty,
} = require("../helpers/address.helper.js");
const { cookieOptions } = require("../helpers/auth.helpers.js");
const seller = require("../models/seller.js");
const { default: mongoose } = require("mongoose");

const generateAccessToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    return accessToken;
  } catch (error) {
    throw error;
  }
};

const generateRefreshToken = async (userId) => {
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

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const refreshToken = await generateRefreshToken(userId);
    const accessToken = await generateAccessToken(userId);
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating token");
  }
};

//auth

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, password, phone } = req.body;

  //user already exists
  const isAccountExistsAlready = await User.findOne({ email });
  if (isAccountExistsAlready) {
    throw new ApiError(409, "user with this email already exists");
  }

  const user = await User.create({ email, password, fullName, phone });
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
  const { email, password } = req.body;
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
    "-password -refreshToken -_id -createdAt -updatedAt -__v"
  );
  return res
    .status(200)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        { accessToken, user: loggedInuser },
        "user logged in successfully"
      )
    );
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incommingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;
  if (!incommingRefreshToken)
    throw new ApiError(401, "unauthorized request Token not found");

  try {
    const decodedToken = jwt.verify(
      incommingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const userId = decodedToken._id;
    const user = await User.findById(userId);
    if (!user) throw new ApiError(401, "User does not exists");
    if (incommingRefreshToken !== user?.refreshToken)
      throw new ApiError(401, "Refresh Token is expired");
    const accessToken = await generateAccessToken(user._id);
    const loggedInuser = await User.findById(user._id).select(
      "-password -refreshToken -_id -createdAt -updatedAt -__v"
    );
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { accessToken, user: loggedInuser },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(
      401,
      error.message || "invalid token, unable to get details"
    );
  }
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
  if (!loggedInuser) {
    throw new ApiError(401, "user not found");
  }
  return res
    .status(200)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "user logged out successfully"));
});

//details

const getLoggedInUserDetails = asyncHandler(async (req, res) => {
  const userId = req._id;
  const user = await User.findById(userId).select("-password -refreshToken");
  if (!user) {
    throw new ApiError(400, "user not found");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { user, userRole: "USER" },
        "user details fetched successfully"
      )
    );
});

//cart

const addToCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const userId = req._id;
  if (!productId || productId.trim().length === 0)
    throw new ApiError(400, "ProductId not given");
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(400, "Product not found");
  }
  await User.findByIdAndUpdate(
    userId,
    { $addToSet: { cart: { product: productId } } },

    {
      new: true,
    }
  );
  return res
    .status(201)
    .json(new ApiResponse(201, productId, "Product has been added to cart"));
});

const deleteFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const userId = req._id;
  if (!productId || productId.trim().length === 0)
    throw new ApiError(400, "ProductId not given");

  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(400, "Product not found");
  }

  try {
    const user = await User.findById(userId);
    const updatedCart = user.cart.filter(
      (item) => item.product.toString() !== productId
    );
    user.cart = updatedCart;
    await user.save();
    return res
      .status(200)
      .json(
        new ApiResponse(200, productId, "Product has been removed from cart")
      );
  } catch (error) {
    console.log(error);
  }
});

const incrementCartItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const userId = req._id;
  if (!productId || productId.trim().length === 0)
    throw new ApiError(400, "ProductId not given");
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(400, "Product not found");
  }
  await User.findOneAndUpdate(
    { _id: userId, "cart.product": productId },
    { $inc: { "cart.$.quantity": 1 } },
    { new: true }
  );
  return res
    .status(201)
    .json(
      new ApiResponse(201, productId, "Product quantity incremented")
    );
});


const decrementCartItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const userId = req._id;
  if (!productId || productId.trim().length === 0)
    throw new ApiError(400, "ProductId not given");
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(400, "Product not found");
  }
  await User.findOneAndUpdate(
    { _id: userId, "cart.product": productId },
    { $inc: { "cart.$.quantity": -1 } },
    { new: true }
  );
  return res
    .status(201)
    .json(
      new ApiResponse(201, productId, "Product quantity decremented")
    );
});

//wishlist

const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const userId = req._id;
  if (!productId || productId.trim().length === 0)
    throw new ApiError(400, "ProductId not given");
  const product = await Product.findById(productId);
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
      new ApiResponse(201, productId, "Product has been added to Wishlist")
    );
});

const deleteFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const userId = req._id;
  if (!productId || productId.trim().length === 0)
    throw new ApiError(400, "ProductId not given");

  const product = await Product.findById(productId);
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
      new ApiResponse(201, productId, "Product has been removed from wishlist")
    );
});

//addresses

const addAddress = asyncHandler(async (req, res) => {
  const {
    receiverName,
    mobileNumber,
    pinCode,
    address1,
    address2,
    landmark,
    city,
    state,
    country,
  } = req.body;
  if (
    [
      receiverName,
      mobileNumber,
      pinCode,
      address1,
      address2,
      city,
      state,
      country,
    ].some((field) => field?.trim().length === 0)
  )
    throw new ApiError(400, "required fields either empty or missing");
  const user = await User.findByIdAndUpdate(
    req._id,
    {
      $addToSet: {
        addresses: {
          receiverName,
          mobileNumber,
          pinCode,
          address1,
          address2,
          landmark: landmark || "",
          city,
          state,
          country,
        },
      },
    },
    {
      new: true,
    }
  );
  const recentAddressObj = user.addresses[user.addresses.length - 1];
  return res
    .status(201)
    .json(new ApiResponse(201, recentAddressObj, "Address added successfully"));
});

const deleteAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;
  if (!addressId) throw new ApiError(400, "addressId not found");
  const user = await User.findById(req._id);
  if (!user) throw new ApiError(400, "user not found");
  user.addresses = user.addresses.filter(
    (address) => address._id.toString() !== addressId
  );
  await user.save();
  return res
    .status(201)
    .json(new ApiResponse(201, addressId, "address deleted successfully"));
});

const makePrimaryAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;
  if (!addressId) throw new ApiError(400, "addressId not found");
  const user = await User.findById(req._id);
  if (!user) throw new ApiError(400, "user not found");
  const requiredAddress = user.addresses.find(
    (address) => address._id.toString() === addressId
  );
  if (!requiredAddress) throw new ApiError(400, "address not found");
  const remainingAddressArray = user.addresses.filter(
    (address) => address._id.toString() !== addressId
  );
  user.addresses = [requiredAddress, ...remainingAddressArray];
  await user.save();
  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        addressId,
        "address has been marked as primary address"
      )
    );
});

const editAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;
  if (!addressId) throw new ApiError(400, "addressId not found");
  const requiredFields = extractRequiredAddressFields(req.body);
  const areFieldsEmptyOrMissing =
    checkRequiredFieldsMissingOrEmpty(requiredFields);
  if (areFieldsEmptyOrMissing)
    throw new ApiError(400, "required fields either empty or missing");
  const user = await User.findById(req._id);
  if (!user) throw new ApiError(400, "user not found");
  const requiredAddress = user.addresses.find(
    (address) => address._id.toString() === addressId
  );
  const newAddress = {
    ...requiredAddress,
    ...requiredFields,
    landmark: req.body.landmark || "",
  };
  const updatedAddressArray = user.addresses.map((address) => {
    if (address._id.toString() === addressId) return newAddress;
    return address;
  });
  user.addresses = updatedAddressArray;
  await user.save();
  const updatedAddress = user.addresses.find(
    (address) => address._id.toString() === addressId
  );
  return res
    .status(201)
    .json(new ApiResponse(201, updatedAddress, "address has been updated"));
});

//seller related routes

const postSellerReview = asyncHandler(async (req, res) => {
  console.log(req._id);
  const { sellerId, userReview, userRatings } = req.body;
  const seller = await Seller.findById(sellerId);
  if (!seller) throw new ApiError(400, "Seller not found");

  const newReview = {
    _id: new mongoose.Types.ObjectId(),
    userRatings,
    userReview,
    user: req._id,
    createdAt: new Date(),
  };

  seller.reviews.push(newReview);
  await seller.save();
  return res
    .status(201)
    .json(new ApiResponse(201, newReview, "review posted successfully"));
});

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getLoggedInUserDetails,
  addToCart,
  incrementCartItem,
  decrementCartItem,
  deleteFromCart,
  addToWishlist,
  deleteFromWishlist,
  addAddress,
  deleteAddress,
  makePrimaryAddress,
  editAddress,
  postSellerReview,
};
