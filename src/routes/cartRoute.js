const express = require('express');
const { verifyUserJwt } = require('../middlewares/auth');
const {
  addToCart,
  deleteFromCart,
  updateCartItemQuantity,
} = require('../controllers/cartController');

const router = express.Router();
router.post('/:productId', verifyUserJwt, addToCart);
router.patch('/:productId', verifyUserJwt, updateCartItemQuantity);
router.delete('/:productId', verifyUserJwt, deleteFromCart);

module.exports = router;
