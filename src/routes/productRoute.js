const express = require("express");
const router = express.Router();
const {addProduct}=require("../controllers/productController.js");
const verifyJwt = require("../middlewares/auth.js");
const upload = require("../middlewares/multer.js");

router.route("/addProduct").post(verifyJwt,upload.array('Paintings'),addProduct)

module.exports = router;
