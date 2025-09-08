const express = require("express");
const { verifySellerJwt } = require("../middlewares/auth.js");
const { sellerDetails, getSellerProducts } = require("../controllers/sellerController");
const router = express.Router();

router.route("/").get(verifySellerJwt,sellerDetails)
router.route("/products").get(verifySellerJwt,getSellerProducts)

module.exports = router;
