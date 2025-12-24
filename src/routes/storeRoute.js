const express = require("express");
const validateRequest = require("../middlewares/validateRequest");
const { storeValidation } = require("../validations/storeValidation");
const { createStore, getStoreDetails, updateStore } = require("../controllers/storeController");
const { verifySellerJwt } = require("../middlewares/auth");
const upload = require("../middlewares/multer");

const router=express.Router();

router.route("/").patch(verifySellerJwt,upload.single("businessLogo"),validateRequest(storeValidation),updateStore)
router.route("/").post(verifySellerJwt,upload.single("businessLogo"),validateRequest(storeValidation),createStore)
router.route("/").get(verifySellerJwt,getStoreDetails)


module.exports=router