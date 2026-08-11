const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authenticate = require('../middleware/auth');

// PayHero routes
router.post('/payhero/initiate', authenticate, paymentController.initiatePayHeroPayment);
router.post('/payhero/ipn', paymentController.handlePayHeroIPN);
router.get('/payhero/status/:tracking_id', authenticate, paymentController.verifyPayHeroPayment);

module.exports = router;