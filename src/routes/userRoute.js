const express = require('express');
const {
  logoutUser,
  updateUser,
  userDetails,
  getUserOrders,
} = require('../controllers/userController');
const upload = require('../middlewares/multer.js');
const { verifyUserJwt } = require('../middlewares/auth.js');
const router = express.Router();

//authorized routes

router
  .route('/')
  .patch(verifyUserJwt, upload.single('profileImage'), updateUser);
router.route('/').get(verifyUserJwt, userDetails);
router.route('/logout').post(verifyUserJwt, logoutUser);
router.route('/orders').get(verifyUserJwt, getUserOrders);

module.exports = router;
