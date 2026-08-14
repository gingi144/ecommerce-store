const express = require('express');
const router = express.Router();

const paymentController = require('../controllers/paymentController');
const authenticate = require('../middleware/auth');

router.post(
  '/paystack/initiate',
  authenticate,
  paymentController.initiatePaystackPayment
);

router.get(
  '/paystack/status/:reference',
  authenticate,
  paymentController.verifyPaystackPayment
);

router.post(
  '/paystack/webhook',
  paymentController.handlePaystackWebhook
);

module.exports = router;