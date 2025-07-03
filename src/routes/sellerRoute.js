const express = require("express");
const { registerSeller, loginSeller, logoutSeller } = require("../controllers/sellerController");
const upload = require("../middlewares/multer.js");
const verifyJwt = require("../middlewares/auth.js");
const validateRequest = require("../middlewares/validateRequest.js");
const { registerValidation, loginValidation } = require("../validations/user.validator.js");
const router = express.Router();

router.route("/register").post(validateRequest(registerValidation), registerSeller);
router.route("/login").post(validateRequest(loginValidation), loginSeller)


//authorized routes

router.route("/logout").post(verifyJwt,logoutSeller);


module.exports = router;
