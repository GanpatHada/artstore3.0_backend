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
  addAddress,
  deleteAddress,
  makePrimaryAddress,
  editAddress,
} = require("../controllers/userController");
const upload = require("../middlewares/multer.js");
const verifyJwt = require("../middlewares/auth.js");
const validateRequest = require("../middlewares/validateRequest.js");
const { loginValidation, registerValidation } = require("../validations/user.validation.js");
const router = express.Router();

router.route("/register").post(validateRequest(registerValidation), registerUser);
router.route("/login").post(validateRequest(loginValidation),loginUser);
router.route("/refreshAccessToken").post(refreshAccessToken);

//authorized routes

router.route("/logout").post(verifyJwt, logoutUser);
router.route("/cart/:productId").post(verifyJwt, addToCart);
router.route("/cart/:productId").delete(verifyJwt, deleteFromCart);
router.route("/wishlist/:productId").post(verifyJwt, addToWishlist);
router.route("/wishlist/:productId").delete(verifyJwt, deleteFromWishlist);
router.route("/address").post(verifyJwt,addAddress)
router.route("/address/:addressId").delete(verifyJwt,deleteAddress)
router.route("/address/makePrimary/:addressId").post(verifyJwt,makePrimaryAddress)
router.route("/userDetails").get(verifyJwt,getLoggedInUserDetails)
router.route("/address/:addressId").patch(verifyJwt,editAddress)

module.exports = router;
