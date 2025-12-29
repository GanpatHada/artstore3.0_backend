const asyncHandler = require('../utils/asynchandler.js');
const ApiError = require('../utils/ApiError.js');
const ApiResponse = require('../utils/ApiResponse.js');
const Seller = require('../models/seller.js');
const uploadOnCloudinary = require('../utils/cloudinary.js');
const Product = require('../models/product.js');
const { cookieOptions } = require('../helpers/auth.helpers.js');
const { default: mongoose } = require('mongoose');

// ================= User details ======================

const userDetails = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, 'user details found'));
});

// ================= Update user details ======================

const updateUser = asyncHandler(async (req, res) => {
  const { fullName, profileImage } = req.body;
  const filePath = req.file?.path;
  const user = req.user;

  if (fullName !== undefined) {
    user.fullName = fullName;
  }

  if (filePath) {
    const profileImageUrl = await uploadOnCloudinary(
      filePath,
      `artstore/users/${user._id}`,
      'profileImage',
    );
    if (!profileImageUrl) {
      throw new ApiError(500, 'Image upload failed', 'IMAGE_UPLOAD_FAILED');
    }
    user.profileImage = profileImageUrl;
  }

  if (profileImage === 'null') {
    user.profileImage = null;
  }
  await user.save();
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { profileImage: user.profileImage, fullName: user.fullName },
        'Profile updated successfully',
      ),
    );
});

// ================= logout user ======================

const logoutUser = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user)
    throw new ApiError(401, 'User not authenticated', 'UNAUTHORIZED_ACCESS');

  user.refreshToken = undefined;
  await user.save();

  return res
    .status(200)
    .clearCookie('refreshToken', cookieOptions)
    .json(new ApiResponse(200, null, 'User logged out successfully'));
});

//helper function

const appendUserReviewToItem = async (item, userId) => {
  const product = await Product.findById(item.product);
  if (!product) return { ...item.toObject(), myReview: null };

  const myReview =
    product.reviews.find((rev) => rev.user.toString() === userId.toString()) ||
    null;

  return { ...item.toObject(), myReview };
};

// ================= getting user orders ======================

const getUserOrders = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user || !user.myOrders || user.myOrders.length === 0) {
    throw new ApiError(404, 'Orders not found', 'ORDER_NOT_FOUND');
  }

  await user.populate('myOrders');

  const updatedOrders = await Promise.all(
    user.myOrders.map(async (order) => {
      const updatedItems = await Promise.all(
        order.orderedItems.map((item) =>
          appendUserReviewToItem(item, user._id),
        ),
      );

      return {
        ...order.toObject(),
        orderedItems: updatedItems,
      };
    }),
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedOrders, 'User orders fetched successfully'),
    );
});

//seller related routes

const postSellerReview = asyncHandler(async (req, res) => {
  console.log(req._id);
  const { sellerId, userReview, userRatings } = req.body;
  const seller = await Seller.findById(sellerId);
  if (!seller) throw new ApiError(400, 'Seller not found', 'SELLER_NOT_FOUND');

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
    .json(new ApiResponse(201, newReview, 'review posted successfully'));
});

module.exports = {
  userDetails,
  logoutUser,
  postSellerReview,
  updateUser,
  getUserOrders,
};
