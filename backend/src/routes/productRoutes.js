const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Public routes
router.get('/', productController.getProducts);
router.get('/:slug', productController.getProductBySlug);
router.get('/:id/related', productController.getRelatedProducts);

module.exports = router;