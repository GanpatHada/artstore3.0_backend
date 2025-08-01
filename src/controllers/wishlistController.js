const Product = require("../models/product");
const User = require("../models/user");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asynchandler");



const createWishlist = asyncHandler(async (req, res) => {
  const userId = req._id;
  const { listName } = req.body;

  if (!listName?.trim()) {
    throw new ApiError(400, "Wishlist name is required", "WISHLIST_NAME_MISSING");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found", "USER_NOT_FOUND");
  }

  const exists = user.wishlists.some(
    (wishlist) => wishlist.listName.toLowerCase() === listName.toLowerCase()
  );

  if (exists) {
    throw new ApiError(409, "Wishlist with this name already exists", "WISHLIST_EXISTS");
  }

  const newWishlist = {
    listName: listName.trim(),
    items: []
  };

  user.wishlists.push(newWishlist);
  await user.save();

  const createdWishlist = user.wishlists.at(-1);

  return res.status(201).json(
    new ApiResponse(201, createdWishlist, "New wishlist added successfully")
  );
});




const deleteWishlist = asyncHandler(async (req, res) => {
  const { wishlistId } = req.params;
  const userId = req._id;

  const user = await User.findById(userId);
  const wishlistIndex = user.wishlists.findIndex(
    (list) => list._id.toString() === wishlistId
  );

  if (wishlistIndex === -1) {
    throw new ApiError(404, "Wishlist not found", "WISHLIST_NOT_FOUND");
  }

  const wishlist = user.wishlists[wishlistIndex];

  if (wishlist.isDefault) {
    throw new ApiError(
      400,
      "Default wishlist cannot be deleted",
      "DEFAULT_WISHLIST_DELETE_DENIED"
    );
  }

  user.wishlists.splice(wishlistIndex, 1);
  await user.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, wishlist._id, "Wishlist deleted successfully")
    );
});


const addItemInWishlist = asyncHandler(async (req, res) => {
  const userId = req._id;
  const { wishlistId } = req.params;
  const { productId } = req.body;

  if (!wishlistId || !productId) {
    throw new ApiError(400, "Wishlist ID and Product ID are required", "MISSING_FIELDS");
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, "Product not found", "PRODUCT_NOT_FOUND");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found", "USER_NOT_FOUND");
  }

  const wishlist = user.wishlists.id(wishlistId);
  if (!wishlist) {
    throw new ApiError(404, "Wishlist not found", "WISHLIST_NOT_FOUND");
  }

  const alreadyExists = wishlist.items.some(
    (item) => item.product.toString() === productId
  );

  if (alreadyExists) {
    throw new ApiError(409, "Product already in wishlist", "PRODUCT_EXISTS");
  }

  const newItem = { product: productId };
  wishlist.items.push(newItem);
  await user.save();

  const addedItem = wishlist.items.at(-1);

  return res.status(200).json(
    new ApiResponse(
      200,
      { wishlistId, item: addedItem },
      "Product added to wishlist successfully"
    )
  );
});


const deleteItemFromWishlist = asyncHandler(async (req, res) => {
  const userId = req._id;
  const { wishlistId, productId } = req.params;

  if (!wishlistId || !productId) {
    throw new ApiError(400, "Wishlist ID and Product ID are required", "MISSING_FIELDS");
  }

  const user = await User.findById(userId);
  const wishlist = user.wishlists.id(wishlistId);
  if (!wishlist) {
    throw new ApiError(404, "Wishlist not found", "WISHLIST_NOT_FOUND");
  }

  const initialLength = wishlist.items.length;

  wishlist.items = wishlist.items.filter(
    (item) => item.product.toString() !== productId
  );

  if (wishlist.items.length === initialLength) {
    throw new ApiError(404, "Product not found in wishlist", "PRODUCT_NOT_IN_WISHLIST");
  }

  await user.save();

  return res.status(200).json(
    new ApiResponse(200, { wishlistId, productId }, "Product removed from wishlist successfully")
  );
});


const moveItemToAnotherWishlist = asyncHandler(async (req, res) => {
  const userId = req._id;
  const { fromWishlistId, toWishlistId, productId } = req.params;

  if (!fromWishlistId || !toWishlistId || !productId) {
    throw new ApiError(400, "All fields are required", "MISSING_FIELDS");
  }

  if (fromWishlistId === toWishlistId) {
    throw new ApiError(400, "Source and target wishlists cannot be the same", "SAME_WISHLIST");
  }

  const user = await User.findById(userId);
  
  const fromWishlist = user.wishlists.id(fromWishlistId);
  const toWishlist = user.wishlists.id(toWishlistId);

  if (!fromWishlist || !toWishlist) {
    throw new ApiError(404, "One or both wishlists not found", "WISHLIST_NOT_FOUND");
  }

  const productIndex = fromWishlist.items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (productIndex === -1) {
    throw new ApiError(404, "Product not found in source wishlist", "PRODUCT_NOT_FOUND");
  }

  const alreadyInTarget = toWishlist.items.some(
    (item) => item.product.toString() === productId
  );

  if (alreadyInTarget) {
    throw new ApiError(409, "Product already exists in target wishlist", "PRODUCT_EXISTS");
  }

  fromWishlist.items.splice(productIndex, 1);

  toWishlist.items.push({ product: productId });

  await user.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      { fromWishlistId, toWishlistId, productId },
      "Product moved to another wishlist successfully"
    )
  );
});





module.exports={
    createWishlist,
    deleteWishlist,
    addItemInWishlist,
    deleteItemFromWishlist,
    moveItemToAnotherWishlist
}


