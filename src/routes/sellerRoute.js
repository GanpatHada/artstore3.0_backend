const express = require("express");
const { registerSeller, loginSeller, logoutSeller } = require("../controllers/sellerController");
const upload = require("../middlewares/multer.js");
const verifyJwt = require("../middlewares/auth.js");
const router = express.Router();

router.route("/signup").post(upload.single("profileImage"), registerSeller);
router.route("/login").post(loginSeller)


//authorized routes

router.route("/logout").post(verifyJwt,logoutSeller);


module.exports = router;
