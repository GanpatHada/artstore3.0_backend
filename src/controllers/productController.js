const { default: mongoose } = require("mongoose");
const Product = require("../models/product");
const User = require("../models/user");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asynchandler");
const uploadOnCloudinary = require("../utils/cloudinary");

const addProduct = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    heightInCm,
    widthInCm,
    category,
    price,
    discount,
  } = req.body;

  //check for missing and empty fields

  if (
    [title, description, category, heightInCm, widthInCm, price].some(
      (field) => field === undefined || field.trim().length === 0
    )
  ) {
    throw new ApiError(400, "required fields are missing or empty");
  }

  //check for imagesPath

  const productImages = req.files;
  if (productImages.length === 0) {
    throw new ApiError(400, "product Images are required");
  }
  const productImagesPath = req.files.map((file) => file.path);
  let productImagesUrls = [];
  if (productImagesPath) {
    for (const productImagePath of productImagesPath) {
      const productImageUrl = await uploadOnCloudinary(productImagePath);
      productImagesUrls.push(productImageUrl);
    }
  }
  //save Product
  const newProduct = await Product.create({
    title,
    description,
    dimensions: {
      height: heightInCm,
      width: widthInCm,
    },
    productImages: productImagesUrls,
    category,
    price,
    actualPrice: price,
    artist: req._id,
    discount: discount || 0,
  });
  if (!newProduct) {
    throw new ApiError(500, "Something went wrong while adding Product");
  }
  return res
    .status(201)
    .json(new ApiResponse(200, newProduct, "Product added successfully!"));
});

const getProducts = asyncHandler(async (req, res) => {
  const idsQuery = req.query.ids;

  let products;

  if (idsQuery) {
    const ids = idsQuery
      .split(",")
      .map((id) => id.trim())
      .filter((id) => mongoose.Types.ObjectId.isValid(id));

    if (ids.length === 0) {
      throw new ApiError(400, "No valid product IDs provided", "INVALID_IDS");
    }

    products = await Product.find({ _id: { $in: ids } }).select(
      "-reviews -bankOffers -descriptions -dimensions -__v -createdAt -updatedAt"
    );
  } else {
    products = await Product.find().select(
      "-reviews -bankOffers -descriptions -dimensions -__v -createdAt -updatedAt"
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, products, "Products fetched successfully"));
});

const getProductDetails = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  try {
    const product = await Product.findById(productId)
      .populate("artist", "_id fullName")
      .populate("reviews.user", "fullName profileImage");
    if (!product) throw new ApiError(400, "Product not found");
    return res
      .status(201)
      .json(
        new ApiResponse(201, product, "Product Details fetched successfully")
      );
  } catch (error) {
    console.log(error);
    throw new ApiError(
      401,
      "Something went wrong while fetching product details"
    );
  }
});

const getProductsUnderOneThousand = asyncHandler(async (_, res) => {
  try {
    const products = await Product.find({ price: { $lt: 1000 } })
      .limit(4)
      .sort({ price: 1 })
      .select("id productImages");
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          products,
          "Products under one thousand fetched successfully"
        )
      );
  } catch (error) {
    console.log(error);
    throw new ApiError(400, "Unable to load products");
  }
});

const getProductOnHighlyDiscount = asyncHandler(async (_, res) => {
  try {
    const products = await Product.find({ discount: { $gt: 40 } })
      .limit(4)
      .sort({ price: 1 })
      .select("id productImages");
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          products,
          "Products which are on high discount fetched successfully"
        )
      );
  } catch (error) {
    console.log(error);
    throw new ApiError(400, "Unable to load products");
  }
});

const getProductsOnLimitedTimeDeal = asyncHandler(async (_, res) => {
  try {
    const products = await Product.find({
      tags: { $in: ["LIMITED TIME DEAL"] },
    })
      .limit(4)
      .sort({ price: 1 })
      .select("id productImages");
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          products,
          "Limited time deal products fetched successfully"
        )
      );
  } catch (error) {
    console.log(error);
    throw new ApiError(400, "Unable to load products");
  }
});

const productReview = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  if (!productId) throw new ApiError(400, "Product's id not given");
  const { rating, review } = req.body;
  if (!rating || !review) throw new ApiError(400, "rating or review is empty");
  const userId = req._id;
  try {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(400, "User not found", "USER_NOT_FOUND");
    const product = await Product.findById(productId);
    if (!product)
      throw new ApiError(400, "Product not found", "PRODUCT_NOT_FOUND");
    const reviewBody = { user: userId, rating, review };
    product.reviews.unshift(reviewBody);
    await product.save();
    const populatedProduct = await Product.findById(productId)
      .select("reviews")
      .populate("reviews.user", "fullName _id profileImage");

    const addedReview = populatedProduct.reviews[0];
    return res
      .status(201)
      .json(new ApiResponse(201, addedReview, "Review added successfully"));
  } catch (error) {
    console.log(error.message);
    throw new ApiError(500, "Internal server error", "INTERNAL_ERROR");
  }
});

const deleteProductReview = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { reviewId } = req.params;
  const userId = req._id;
  if (!productId) throw new ApiError(400, "Product's id not given");
  if (!reviewId) throw new ApiError(400, "Review's id not given");
  try {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(400, "User not found", "USER_NOT_FOUND");
    const product = await Product.findById(productId);
    if (!product) throw new ApiError(400, "Product not found");

    const reviewExists = product.reviews.some(
      (review) => review._id.toString() === reviewId.toString()
    );
    if (!reviewExists) throw new ApiError(400, "review not found");

    product.reviews = product.reviews.filter(
      (review) => review._id.toString() !== reviewId.toString()
    );
    await product.save();
    return res
      .status(201)
      .json(new ApiResponse(201, reviewId, "Review deleted successfully"));
  } catch (error) {
    console.log(error.message);
    throw new ApiError(500, "Internal server error", "INTERNAL_ERROR");
  }
});

const updateProductReview = asyncHandler(async (req, res) => {
  const { productId, reviewId } = req.params;
  const userId = req._id;
  const { review, rating } = req.body;

  if (!productId) throw new ApiError(400, "Product ID not provided");
  if (!reviewId) throw new ApiError(400, "Review ID not provided");

  if (review === undefined && rating === undefined) {
    throw new ApiError(
      400,
      "At least one of 'review' or 'rating' must be provided"
    );
  }

  try {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(400, "User not found", "USER_NOT_FOUND");

    const product = await Product.findById(productId);
    if (!product) throw new ApiError(400, "Product not found");

    const existingReview = product.reviews.find(
      (r) => r._id.toString() === reviewId.toString()
    );

    if (!existingReview) throw new ApiError(404, "Review not found");

    if (existingReview.user.toString() !== userId.toString()) {
      throw new ApiError(403, "You are not authorized to update this review");
    }

    if (review !== undefined) existingReview.review = review;
    if (rating !== undefined) existingReview.rating = rating;

    await product.save();

    const populatedProduct = await Product.findById(productId)
      .select("reviews")
      .populate("reviews.user", "fullName _id profileImage");

    const updatedReview = populatedProduct.reviews.find(
      (r) => r._id.toString() === reviewId.toString()
    );

    return res
      .status(201)
      .json(new ApiResponse(201, updatedReview, "Review updated successfully"));
  } catch (error) {
    console.log(error.message);
    throw new ApiError(500, "Internal server error", "INTERNAL_ERROR");
  }
});

module.exports = {
  addProduct,
  getProducts,
  getProductDetails,
  getProductsUnderOneThousand,
  getProductOnHighlyDiscount,
  getProductsOnLimitedTimeDeal,
  productReview,
  deleteProductReview,
  updateProductReview,
};
