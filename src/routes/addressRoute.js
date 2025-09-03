const express = require('express');
const { verifyUserJwt } = require('../middlewares/auth');
const { addAddress, deleteAddress, makePrimaryAddress, editAddress } = require('../controllers/addressController');

const router = express.Router();

router.route("/").post(verifyUserJwt,addAddress)
router.route("/:addressId").delete(verifyUserJwt,deleteAddress)
router.route("/makePrimary/:addressId").post(verifyUserJwt,makePrimaryAddress)
router.route("/:addressId").patch(verifyUserJwt,editAddress)

module.exports = router;
