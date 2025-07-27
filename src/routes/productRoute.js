const express = require("express");
const router = express.Router();
const {addProduct, getProducts, getProductDetails, getProductOnHighlyDiscount, getProductsUnderOneThousand, getProductsOnLimitedTimeDeal, productReview, deleteProductReview, updateProductReview, getMyProductReview}=require("../controllers/productController.js");
const verifyJwt = require("../middlewares/auth.js");
const upload = require("../middlewares/multer.js");

router.route("/").get(getProducts);
router.route("/productsUnderOneThousand").get(getProductsUnderOneThousand)
router.route("/getProductOnHighlyDiscount").get(getProductOnHighlyDiscount)
router.route("/getProductsOnLimitedTimeDeal").get( getProductsOnLimitedTimeDeal)
router.route("/:productId").get(getProductDetails);
router.route("/addProduct").post(verifyJwt,upload.array('Paintings'),addProduct)
router.route("/:productId/reviews").post(verifyJwt,productReview)
router.route("/:productId/reviews").get(verifyJwt,getMyProductReview)
router.route("/:productId/reviews/:reviewId").delete(verifyJwt,deleteProductReview)
router.route("/:productId/reviews/:reviewId").patch(verifyJwt,updateProductReview)

module.exports = router;
