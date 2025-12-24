const express = require("express");
const { verifySellerJwt } = require("../middlewares/auth.js");
const {
  sellerDetails,
  getSellerProducts,
  getSellerProductStats,
  updateSeller,
} = require("../controllers/sellerController");
const upload = require("../middlewares/multer.js");
const router = express.Router();

router
  .route("/")
  .patch(verifySellerJwt, upload.single("profileImage"), updateSeller);
router.route("/").get(verifySellerJwt, sellerDetails);
router.route("/products").get(verifySellerJwt, getSellerProducts);
router.route("/stats").get(verifySellerJwt, getSellerProductStats);

module.exports = router;
