const Product = require("../models/product");
const User = require("../models/user");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asynchandler");

const addToCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.query;
  const user = req.user;

  if (!productId || productId.trim().length === 0) {
    throw new ApiError(400, "ProductId not provided", "MISSING_PRODUCT_ID");
  }

  const qty = parseInt(quantity, 10) || 1;

  if (qty <= 0) {
    throw new ApiError(
      400,
      "Quantity must be greater than 0",
      "INVALID_QUANTITY",
    );
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, "Product not found", "PRODUCT_NOT_FOUND");
  }

  const alreadyInCart = user.cart.some(
    (item) => item.product.toString() === productId,
  );

  if (alreadyInCart) {
    throw new ApiError(400, "Product already in cart", "DUPLICATE_CART_ITEM");
  }

  user.cart.push({ product: productId, quantity: qty });
  await user.save();

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { product: productId, quantity: qty },
        "Product has been added to cart",
      ),
    );
});

const deleteFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const user = req.user;

  if (!productId || productId.trim().length === 0) {
    throw new ApiError(400, "ProductId not provided", "MISSING_PRODUCT_ID");
  }

  const originalCartLength = user.cart.length;
  user.cart = user.cart.filter((item) => item.product.toString() !== productId);

  if (user.cart.length === originalCartLength) {
    throw new ApiError(400, "Product not in cart", "PRODUCT_NOT_IN_CART");
  }
  await user.save();
  return res
    .status(200)
    .json(
      new ApiResponse(200, productId, "Product has been removed from cart"),
    );
});

const updateCartItemQuantity = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { action } = req.query;
  const user = req.user;

  if (!productId || productId.trim().length === 0) {
    throw new ApiError(400, "ProductId not provided", "MISSING_PRODUCT_ID");
  }

  const cartItem = user.cart.find(
    (item) => item.product.toString() === productId,
  );
  if (!cartItem) {
    throw new ApiError(400, "Product not in cart", "PRODUCT_NOT_IN_CART");
  }

  let incrementValue;

  switch (action) {
    case "increment":
      incrementValue = 1;
      break;

    case "decrement":
      if (cartItem.quantity <= 1) {
        throw new ApiError(
          400,
          "Quantity cannot be less than 1",
          "MIN_QUANTITY_REACHED",
        );
      }
      incrementValue = -1;
      break;

    default:
      throw new ApiError(400, "Invalid action", "INVALID_ACTION");
  }

  await User.updateOne(
    { _id: user._id, "cart.product": productId },
    { $inc: { "cart.$.quantity": incrementValue } },
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { productId, quantity: cartItem.quantity + incrementValue },
        `Product quantity ${action}ed successfully`,
      ),
    );
});

module.exports = { addToCart, deleteFromCart, updateCartItemQuantity };
