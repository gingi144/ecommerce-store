const express = require('express');
const router = express.Router();

const wishlistController = require('../controllers/wishlistController');
const authenticate = require('../middleware/auth');

// Get user's wishlist
router.get(
  '/',
  authenticate,
  wishlistController.getWishlist
);

// Get wishlist count
router.get(
  '/count',
  authenticate,
  wishlistController.getWishlistCount
);

// Check if product is in wishlist
router.get(
  '/check/:productId',
  authenticate,
  wishlistController.checkWishlist
);

// Add product to wishlist
router.post(
  '/',
  authenticate,
  wishlistController.addToWishlist
);

// Remove product from wishlist
router.delete(
  '/:productId',
  authenticate,
  wishlistController.removeFromWishlist
);

module.exports = router;