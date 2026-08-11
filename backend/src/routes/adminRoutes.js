const express = require('express');
const router = express.Router();
const multer = require('multer');
const authenticate = require('../middleware/auth');
const adminCheck = require('../middleware/admin');
const adminController = require('../controllers/adminController');

// Configure multer for image upload
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, WEBP, and GIF are allowed.'));
    }
  }
});

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(adminCheck);

// ===== DASHBOARD =====
router.get('/dashboard/stats', adminController.getDashboardStats);

// ===== CATEGORIES =====
router.get('/categories', adminController.getCategories);

// ===== IMAGE UPLOAD =====
router.post('/upload', upload.array('images', 10), adminController.uploadImages);

// ===== PRODUCTS =====
router.get('/products', adminController.getAllProducts);
router.get('/products/:id', adminController.getProductById);
router.post('/products', adminController.createProduct);
router.put('/products/:id', adminController.updateProduct);
router.delete('/products/:id', adminController.deleteProduct);

// ===== ORDERS =====
router.get('/orders', adminController.getAllOrders);
router.put('/orders/:id/status', adminController.updateOrderStatus);

// ===== USERS =====
router.get('/users', adminController.getAllUsers);
router.put('/users/:id/role', adminController.updateUserRole);
router.delete('/users/:id', adminController.deleteUser);

// ===== FLASH SALE =====
router.get('/flash-sale/settings', adminController.getFlashSaleSettings);
router.get('/flash-sale/products', adminController.getFlashSaleProducts);

module.exports = router;