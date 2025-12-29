const express = require('express');
const { verifyUserJwt } = require('../middlewares/auth');

const {
  createWishlist,
  deleteWishlist,
  editWishlist,
  addItemInWishlist,
  deleteItemFromWishlist,
  moveItemToAnotherWishlist,
  addNoteToWishlistItem,
  editNoteInWishlistItem,
  deleteNoteFromWishlistItem,
} = require('../controllers/wishlistController');

const router = express.Router();

router.route('/').post(verifyUserJwt, createWishlist);
router.route('/:wishlistId').delete(verifyUserJwt, deleteWishlist);
router.route('/:wishlistId').patch(verifyUserJwt, editWishlist);
router.route('/:wishlistId/items').post(verifyUserJwt, addItemInWishlist);
router
  .route('/:wishlistId/items/:productId')
  .delete(verifyUserJwt, deleteItemFromWishlist);
router
  .route('/:fromWishlistId/items/:productId/move/:toWishlistId')
  .patch(verifyUserJwt, moveItemToAnotherWishlist);
router.post(
  '/:wishlistId/items/:productId/note',
  verifyUserJwt,
  addNoteToWishlistItem,
);
router.put(
  '/:wishlistId/items/:productId/note',
  verifyUserJwt,
  editNoteInWishlistItem,
);
router.delete(
  '/:wishlistId/items/:productId/note',
  verifyUserJwt,
  deleteNoteFromWishlistItem,
);

module.exports = router;
