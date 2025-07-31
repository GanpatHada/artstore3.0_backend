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
const { default: mongoose } = require("mongoose");
const {
  generateAccessAndRefreshToken,
  generateAccessTokenHelper,
} = require("../helpers/user.helper.js");

//auth
//user registration

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, password, phone } = req.body;

  const isEmailExists = await User.findOne({ email });
  if (isEmailExists) {
    throw new ApiError(
      409,
      "User with this email already exists",
      "USER_ALREADY_EXISTS"
    );
  }

  const isPhoneExists = await User.findOne({ phone });
  if (isPhoneExists) {
    throw new ApiError(
      409,
      "User with this phone already exists",
      "USER_ALREADY_EXISTS"
    );
  }

  const user = await User.create({ email, password, fullName, phone });

  return res
    .status(201)
    .json(new ApiResponse(200, user.email, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { emailOrPhone, password } = req.body;
  const userFound = await User.findOne({
    $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
  });
  if (!userFound) {
    throw new ApiError(
      409,
      "User does not exist with this email or phone",
      "USER_NOT_FOUND"
    );
  }
  const validPassword = await userFound.isPasswordCorrect(password);
  if (!validPassword) {
    throw new ApiError(409, "Incorrect password ! please try again");
  }
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    userFound._id
  );
  const loggedInuser = await User.findById(userFound._id).select(
    "-password -refreshToken  -createdAt -updatedAt -__v"
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

const userDetails = asyncHandler(async (req, res) => {
  const userId = req._id;
  try {
    const user = await User.findById(userId).select(
      "-password -refreshToken -createdAt -updatedAt -__v"
    );
    if (!user) throw new ApiError(400, "user not found", "USER_NOT_FOUND");
    return res
      .status(200)
      .json(new ApiResponse(200, user, "user details found"));
  } catch (error) {
    throw new ApiError(
      error.message || "something went wrong while fetching user details"
    );
  }
});

const updateUser = asyncHandler(async (req, res) => {
  const { fullName, profileImage } = req.body;
  const filePath = req.file?.path;
  try {
    const user = await User.findById(req._id);
    if (fullName !== undefined) {
      user.fullName = fullName;
    }
    if (filePath) {
      const profileImageUrl = await uploadOnCloudinary(filePath);
      if (!profileImageUrl) {
        throw new ApiError(500, "Image upload failed");
      }
      user.profileImage = profileImageUrl;
    }
    if (profileImage === "null") {
      user.profileImage = null;
    }
    await user.save();
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { profileImage: user.profileImage, fullName: user.fullName },
          "Profile updated successfully"
        )
      );
  } catch (error) {
    throw new ApiError(
      500,
      error.message || "Something went wrong while updating profile"
    );
  }
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken)
    throw new ApiError(401, "unauthorized request", "MISSED_REFRESH_TOKEN");

  let decodedToken;
  try {
    decodedToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
  } catch (error) {
    const isExpired = error.name === "TokenExpiredError";
    throw new ApiError(
      401,
      isExpired ? "Refresh token expired" : "Invalid refresh token",
      isExpired ? "EXPIRED_REFRESH_TOKEN" : "INVALID_REFRESH_TOKEN"
    );
  }
  const user = await User.findById(decodedToken._id);
  if (!user) throw new ApiError(401, "User does not exists", "USER_NOT_FOUND");
  if (refreshToken !== user?.refreshToken)
    throw new ApiError(401, "Refresh token mismatch", "INVALID_REFRESH_TOKEN");
  const accessToken = await generateAccessTokenHelper(user._id);
  return res
    .status(200)
    .json(new ApiResponse(200, accessToken, "Access token refreshed"));
});

const logoutUser = asyncHandler(async (req, res) => {
  const loggedInuser = await User.findByIdAndUpdate(
    req._id,
    {
      $unset: {
        refreshToken: "",
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
    .json(new ApiResponse(200, null, "user logged out successfully"));
});

//details

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
    .json(new ApiResponse(201, productId, "Product quantity incremented"));
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
    .json(new ApiResponse(201, productId, "Product quantity decremented"));
});



const getUserOrders = asyncHandler(async (req, res) => {
  const user = await User.findById(req._id).populate("myOrders");

  if (!user || !user.myOrders || user.myOrders.length === 0) {
    throw new ApiError(404, "Orders not found", "ORDER_NOT_FOUND");
  }

  const updatedOrders = [];

  for (const order of user.myOrders) {
    const updatedItems = await Promise.all(
      order.orderedItems.map(async (item) => {
        const product = await Product.findById(item.product);

        const myReview = product.reviews.find(
          (rev) => rev.user.toString() === req._id.toString()
        );

        return {
          ...item.toObject(),
          myReview: myReview || null,
        };
      })
    );

    updatedOrders.push({
      ...order.toObject(),
      orderedItems: updatedItems,
    });
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedOrders, "User orders fetched successfully")
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

//product reviews

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
  userDetails,
  logoutUser,
  refreshAccessToken,
  addToCart,
  incrementCartItem,
  decrementCartItem,
  deleteFromCart,
  addAddress,
  deleteAddress,
  makePrimaryAddress,
  editAddress,
  postSellerReview,
  updateUser,
  getUserOrders,
};
