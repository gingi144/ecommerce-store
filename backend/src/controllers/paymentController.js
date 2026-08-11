const pool = require('../config/database');
const axios = require('axios');
const crypto = require('crypto');

// Generate unique order tracking ID
const generateOrderTrackingId = () => {
  return 'ORDER-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
};

// Generate Basic Auth header
const getAuthHeader = () => {
  // Use the Basic Auth token directly
  const basicAuth = process.env.PAYHERO_BASIC_AUTH_TOKEN;
  if (basicAuth) {
    return 'Basic ' + basicAuth;
  }
  // Or generate from username and password
  const username = process.env.PAYHERO_API_USERNAME;
  const password = process.env.PAYHERO_API_PASSWORD;
  const credentials = username + ':' + password;
  return 'Basic ' + Buffer.from(credentials).toString('base64');
};

// Initiate PayHero payment
const initiatePayHeroPayment = async (req, res) => {
  console.log('PayHero initiate endpoint hit');
  console.log('Request body:', req.body);

  const { orderId, amount, phoneNumber, email, firstName, lastName } = req.body;

  if (!orderId || !amount || !phoneNumber) {
    console.log('Missing required fields');
    return res.status(400).json({ 
      success: false, 
      error: 'Missing required fields' 
    });
  }

  try {
    const trackingId = generateOrderTrackingId();
    console.log('Generated tracking ID:', trackingId);

    // For now, use fallback mode since PayHero API details are being configured
    console.log('Using fallback payment mode for testing');
    
    // Save payment record
    await pool.query(
      `INSERT INTO payments (order_id, amount, payment_method, reference, status, tracking_id, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [orderId, amount, 'PAYHERO', trackingId, 'pending', trackingId]
    );

    await pool.query(
      `UPDATE orders SET payment_reference = $1 WHERE id = $2`,
      [trackingId, orderId]
    );

    console.log('Payment record saved successfully');

    res.json({
      success: true,
      redirect_url: 'http://localhost:5173/payment-status?order_tracking_id=' + trackingId,
      tracking_id: trackingId,
      message: 'Payment initiated'
    });

  } catch (error) {
    console.error('PayHero payment error:', error);
    res.status(500).json({
      success: false,
      error: 'Payment initiation failed: ' + error.message
    });
  }
};

// IPN Webhook
const handlePayHeroIPN = async (req, res) => {
  console.log('PayHero IPN received:', req.body);

  const { transaction_id, status, reference } = req.body;

  try {
    await pool.query(
      `UPDATE payments 
       SET status = $1, updated_at = NOW() 
       WHERE reference = $2 OR tracking_id = $2`,
      [status === 'COMPLETED' ? 'completed' : 'failed', reference || transaction_id]
    );

    res.status(200).json({ status: 'OK' });

  } catch (error) {
    console.error('PayHero IPN error:', error);
    res.status(500).json({ error: 'IPN processing failed' });
  }
};

// Verify payment status
const verifyPayHeroPayment = async (req, res) => {
  const { tracking_id } = req.params;

  console.log('Verifying payment for tracking ID:', tracking_id);

  try {
    const paymentResult = await pool.query(
      `SELECT * FROM payments WHERE tracking_id = $1 OR reference = $1`,
      [tracking_id]
    );

    if (paymentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    const payment = paymentResult.rows[0];
    console.log('Payment found:', payment);

    // Auto-complete after 10 seconds for testing
    if (payment.status === 'pending') {
      const createdTime = new Date(payment.created_at);
      const now = new Date();
      const diff = (now - createdTime) / 1000;
      
      if (diff > 10) {
        console.log('Auto-completing payment for order:', payment.order_id);
        await pool.query(
          `UPDATE payments SET status = 'completed', updated_at = NOW() WHERE id = $1`,
          [payment.id]
        );
        await pool.query(
          `UPDATE orders SET payment_status = 'paid', status = 'processing' WHERE id = $1`,
          [payment.order_id]
        );
        payment.status = 'completed';
      }
    }

    res.json({
      success: true,
      payment: {
        id: payment.id,
        order_id: payment.order_id,
        amount: payment.amount,
        status: payment.status,
        reference: payment.reference,
        tracking_id: payment.tracking_id,
        created_at: payment.created_at
      }
    });

  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
};

module.exports = {
  initiatePayHeroPayment,
  handlePayHeroIPN,
  verifyPayHeroPayment
};