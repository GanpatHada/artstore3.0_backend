const validator = require("validator");
const Product = require("../models/product");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asynchandler");

// ================= Create new wishlist ======================

const createWishlist = asyncHandler(async (req, res) => {
  const user = req.user;
  const { listName } = req.body;

  if (!listName?.trim()) {
    throw new ApiError(
      400,
      "Wishlist name is required",
      "WISHLIST_NAME_MISSING",
    );
  }

  const wishlistExists = user.wishlists.some(
    (wishlist) => wishlist.listName.toLowerCase() === listName.toLowerCase(),
  );
  if (wishlistExists) {
    throw new ApiError(
      409,
      "Wishlist with this name already exists",
      "WISHLIST_EXISTS",
    );
  }

  const newWishlist = { listName: listName.trim(), items: [] };
  user.wishlists.push(newWishlist);
  await user.save();

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        user.wishlists.at(-1),
        "New wishlist added successfully",
      ),
    );
});

// ================= Edit wishlist ======================

const editWishlist = asyncHandler(async (req, res) => {
  const user = req.user;
  const { wishlistId } = req.params;
  const { listName, isDefault, email } = req.body;

  const wishlist = user.wishlists.id(wishlistId);
  if (!wishlist)
    throw new ApiError(404, "Wishlist not found", "WISHLIST_NOT_FOUND");

  if (listName?.trim()) {
    const exists = user.wishlists.some(
      (w) =>
        w._id.toString() !== wishlistId &&
        w.listName.toLowerCase() === listName.trim().toLowerCase(),
    );
    if (exists)
      throw new ApiError(
        409,
        "Wishlist with this name already exists",
        "WISHLIST_EXISTS",
      );

    wishlist.listName = listName.trim();
  }

  if (typeof email === "string") {
    if (email.trim() && !validator.isEmail(email)) {
      throw new ApiError(400, "Invalid email format", "INVALID_EMAIL");
    }
    wishlist.email = email;
  }

  if (typeof isDefault === "boolean" && isDefault) {
    user.wishlists.forEach(
      (w) => (w.isDefault = w._id.toString() === wishlistId),
    );
  }

  await user.save();
  return res
    .status(200)
    .json(new ApiResponse(200, wishlist, "Wishlist updated successfully"));
});

// ================= Delete wishlist ======================

const deleteWishlist = asyncHandler(async (req, res) => {
  const user = req.user;
  const { wishlistId } = req.params;

  const wishlistIndex = user.wishlists.findIndex(
    (w) => w._id.toString() === wishlistId,
  );
  if (wishlistIndex === -1)
    throw new ApiError(404, "Wishlist not found", "WISHLIST_NOT_FOUND");

  const wishlist = user.wishlists[wishlistIndex];
  if (wishlist.isDefault)
    throw new ApiError(
      400,
      "Default wishlist cannot be deleted",
      "DEFAULT_WISHLIST_DELETE_DENIED",
    );

  user.wishlists.splice(wishlistIndex, 1);
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, wishlist._id, "Wishlist deleted successfully"));
});

// ================= Add Item in wishlist ======================

const addItemInWishlist = asyncHandler(async (req, res) => {
  const user = req.user;
  const { wishlistId } = req.params;
  const { productId } = req.body;

  if (!wishlistId || !productId)
    throw new ApiError(
      400,
      "Wishlist ID and Product ID are required",
      "MISSING_FIELDS",
    );

  const product = await Product.findById(productId);
  if (!product)
    throw new ApiError(404, "Product not found", "PRODUCT_NOT_FOUND");

  const wishlist = user.wishlists.id(wishlistId);
  if (!wishlist)
    throw new ApiError(404, "Wishlist not found", "WISHLIST_NOT_FOUND");

  if (wishlist.items.some((i) => i.product.toString() === productId)) {
    throw new ApiError(409, "Product already in wishlist", "PRODUCT_EXISTS");
  }

  wishlist.items.push({ product: productId });
  await user.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { wishlistId, item: wishlist.items.at(-1) },
        "Product added to wishlist successfully",
      ),
    );
});

// ================= Delete item from wishlist ======================

const deleteItemFromWishlist = asyncHandler(async (req, res) => {
  const user = req.user;
  const { wishlistId, productId } = req.params;

  if (!wishlistId || !productId)
    throw new ApiError(
      400,
      "Wishlist ID and Product ID are required",
      "MISSING_FIELDS",
    );

  const wishlist = user.wishlists.id(wishlistId);
  if (!wishlist)
    throw new ApiError(404, "Wishlist not found", "WISHLIST_NOT_FOUND");

  const initialLength = wishlist.items.length;
  wishlist.items = wishlist.items.filter(
    (item) => item.product.toString() !== productId,
  );

  if (wishlist.items.length === initialLength)
    throw new ApiError(
      404,
      "Product not found in wishlist",
      "PRODUCT_NOT_IN_WISHLIST",
    );

  await user.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { wishlistId, productId },
        "Product removed from wishlist successfully",
      ),
    );
});

// ================= Move item into another wishlist ======================

const moveItemToAnotherWishlist = asyncHandler(async (req, res) => {
  const user = req.user;
  const { fromWishlistId, toWishlistId, productId } = req.params;

  if (!fromWishlistId || !toWishlistId || !productId)
    throw new ApiError(400, "All fields are required", "MISSING_FIELDS");
  if (fromWishlistId === toWishlistId)
    throw new ApiError(
      400,
      "Source and target wishlists cannot be the same",
      "SAME_WISHLIST",
    );

  const fromWishlist = user.wishlists.id(fromWishlistId);
  const toWishlist = user.wishlists.id(toWishlistId);

  if (!fromWishlist || !toWishlist)
    throw new ApiError(
      404,
      "One or both wishlists not found",
      "WISHLIST_NOT_FOUND",
    );

  const productIndex = fromWishlist.items.findIndex(
    (i) => i.product.toString() === productId,
  );
  if (productIndex === -1)
    throw new ApiError(
      404,
      "Product not found in source wishlist",
      "PRODUCT_NOT_FOUND",
    );

  if (toWishlist.items.some((i) => i.product.toString() === productId))
    throw new ApiError(
      409,
      "Product already exists in target wishlist",
      "PRODUCT_EXISTS",
    );

  fromWishlist.items.splice(productIndex, 1);
  toWishlist.items.push({ product: productId });

  await user.save();
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { fromWishlistId, toWishlistId, productId },
        "Product moved to another wishlist successfully",
      ),
    );
});

// ================= Add note on wihlist product ======================

const addNoteToWishlistItem = asyncHandler(async (req, res) => {
  const user = req.user;
  const { wishlistId, productId } = req.params;
  const { comment, priority } = req.body;

  if (!wishlistId || !productId)
    throw new ApiError(
      400,
      "Wishlist ID and Product ID are required",
      "MISSING_FIELDS",
    );
  if (!["Low", "Medium", "High"].includes(priority))
    throw new ApiError(400, "Invalid priority value", "INVALID_PRIORITY");

  const wishlist = user.wishlists.id(wishlistId);
  if (!wishlist)
    throw new ApiError(404, "Wishlist not found", "WISHLIST_NOT_FOUND");

  const item = wishlist.items.find((i) => i.product.toString() === productId);
  if (!item)
    throw new ApiError(
      404,
      "Product not found in wishlist",
      "PRODUCT_NOT_IN_WISHLIST",
    );
  if (item.note)
    throw new ApiError(
      400,
      "Note already exists, use edit API instead",
      "NOTE_ALREADY_EXISTS",
    );

  item.note = { comment: comment || "", priority: priority || "Medium" };
  await user.save();

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { wishlistId, productId, note: item.note },
        "Note added successfully",
      ),
    );
});

// ================= Edit note of wishlist product ======================

const editNoteInWishlistItem = asyncHandler(async (req, res) => {
  const user = req.user;
  const { wishlistId, productId } = req.params;
  const { comment, priority } = req.body;

  if (!wishlistId || !productId)
    throw new ApiError(
      400,
      "Wishlist ID and Product ID are required",
      "MISSING_FIELDS",
    );

  const wishlist = user.wishlists.id(wishlistId);
  if (!wishlist)
    throw new ApiError(404, "Wishlist not found", "WISHLIST_NOT_FOUND");

  const item = wishlist.items.find((i) => i.product.toString() === productId);
  if (!item)
    throw new ApiError(
      404,
      "Product not found in wishlist",
      "PRODUCT_NOT_IN_WISHLIST",
    );
  if (!item.note)
    throw new ApiError(
      404,
      "Note does not exist, use add API instead",
      "NOTE_NOT_FOUND",
    );

  if (comment !== undefined) item.note.comment = comment;
  if (priority !== undefined) {
    if (!["Low", "Medium", "High"].includes(priority))
      throw new ApiError(400, "Invalid priority value", "INVALID_PRIORITY");
    item.note.priority = priority;
  }

  await user.save();
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { wishlistId, productId, note: item.note },
        "Note updated successfully",
      ),
    );
});

// ================= Delete note from wishlist product ======================

const deleteNoteFromWishlistItem = asyncHandler(async (req, res) => {
  const user = req.user;
  const { wishlistId, productId } = req.params;

  if (!wishlistId || !productId)
    throw new ApiError(
      400,
      "Wishlist ID and Product ID are required",
      "MISSING_FIELDS",
    );

  const wishlist = user.wishlists.id(wishlistId);
  if (!wishlist)
    throw new ApiError(404, "Wishlist not found", "WISHLIST_NOT_FOUND");

  const item = wishlist.items.find((i) => i.product.toString() === productId);
  if (!item)
    throw new ApiError(
      404,
      "Product not found in wishlist",
      "PRODUCT_NOT_IN_WISHLIST",
    );
  if (!item.note) throw new ApiError(404, "Note not found", "NOTE_NOT_FOUND");

  item.note = null;
  await user.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { wishlistId, productId },
        "Note deleted successfully",
      ),
    );
});

module.exports = {
  createWishlist,
  editWishlist,
  deleteWishlist,
  addItemInWishlist,
  deleteItemFromWishlist,
  moveItemToAnotherWishlist,
  addNoteToWishlistItem,
  editNoteInWishlistItem,
  deleteNoteFromWishlistItem,
};
