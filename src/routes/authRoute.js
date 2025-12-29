const express = require('express');
const validateRequest = require('../middlewares/validateRequest');
const {
  signupValidation,
  loginValidation,
} = require('../validations/authValidation');
const {
  signup,
  login,
  refreshAccessToken,
} = require('../controllers/authController');
const router = express.Router();

router.route('/:mode/signup').post(validateRequest(signupValidation), signup);
router.route('/:mode/login').post(validateRequest(loginValidation), login);
router.route('/:mode/refreshAccessToken').post(refreshAccessToken);

module.exports = router;
