const express = require("express");
const { registerUser, loginUser, logoutUser } = require("../controllers/userController");
const upload = require("../middlewares/multer.js");
const verifyJwt = require("../middlewares/auth.js");
const router = express.Router();

router.route("/register").post(upload.single("profileImage"), registerUser);
router.route("/login").post(loginUser)


//authorized routes

router.route("/logout").post(verifyJwt,logoutUser)

module.exports = router;