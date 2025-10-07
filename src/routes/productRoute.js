const express = require("express");
const router = express.Router();
const {addProduct, getProducts, getProductDetails,productReview, deleteProductReview, updateProductReview, getMyProductReview, toggleAvailability, getSpecialProducts}=require("../controllers/productController.js");
const upload = require("../middlewares/multer.js");
const { verifyUserJwt, verifySellerJwt } = require("../middlewares/auth.js");
const validateRequest = require("../middlewares/validateRequest.js");
const { productValidation } = require("../validations/productValidation.js");

router.route("/").get(getProducts);
router.route("/special").get(getSpecialProducts)
router.route("/").post(upload.array("productImages"),validateRequest(productValidation),verifySellerJwt,addProduct);
router.route("/:productId/toggle-availability").patch(verifySellerJwt, toggleAvailability);
router.route("/:productId").get(getProductDetails);
router.route("/:productId/reviews").post(verifyUserJwt,productReview)
router.route("/:productId/reviews").get(verifyUserJwt,getMyProductReview)
router.route("/:productId/reviews/:reviewId").delete(verifyUserJwt,deleteProductReview)
router.route("/:productId/reviews/:reviewId").patch(verifyUserJwt,updateProductReview)

module.exports = router;
