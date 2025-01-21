const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
  addToCart,
  deleteFromCart,
  addToWishlist,
  deleteFromWishlist,
  getLoggedInUserDetails,
  refreshAccessToken,
} = require("../controllers/userController");
const upload = require("../middlewares/multer.js");
const verifyJwt = require("../middlewares/auth.js");
const router = express.Router();

router.route("/register").post(upload.single("profileImage"), registerUser);
router.route("/login").post(loginUser);
router.route("/refreshAccessToken").post(refreshAccessToken);

//authorized routes

router.route("/logout").post(verifyJwt, logoutUser);
router.route("/cart/:productId").post(verifyJwt, addToCart);
router.route("/cart/:productId").delete(verifyJwt, deleteFromCart);
router.route("/wishlist/:productId").post(verifyJwt, addToWishlist);
router.route("/wishlist/:productId").delete(verifyJwt, deleteFromWishlist);
router.route("/userDetails").get(verifyJwt,getLoggedInUserDetails)

module.exports = router;
