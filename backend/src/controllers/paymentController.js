const pool = require('../config/database');
const axios = require('axios');

// ============================================================
// CONFIGURATION
// ============================================================

const PAYHERO_API_BASE_URL =
  process.env.PAYHERO_API_BASE_URL || 'https://backend.payhero.co.ke/api/v2';

const FRONTEND_URL =
  process.env.FRONTEND_URL ||
  'https://ecommerce-store-iota-tan.vercel.app';

const PAYHERO_CALLBACK_URL =
  process.env.PAYHERO_CALLBACK_URL ||
  `${FRONTEND_URL}/payment-status`;

const PAYHERO_IPN_URL =
  process.env.PAYHERO_IPN_URL ||
  'https://ecommerce-store-9o2p.onrender.com/api/payments/payhero/ipn';


// ============================================================
// GENERATE UNIQUE ORDER TRACKING ID
// ============================================================

const generateOrderTrackingId = () => {
  return (
    'ORDER-' +
    Date.now() +
    '-' +
    Math.random().toString(36).substring(2, 7).toUpperCase()
  );
};


// ============================================================
// PAYHERO AUTHENTICATION
// ============================================================

const getAuthHeader = () => {
  const basicAuth = process.env.PAYHERO_BASIC_AUTH_TOKEN;

  if (basicAuth) {
    return {
      Authorization: `Basic ${basicAuth}`
    };
  }

  const username = process.env.PAYHERO_API_USERNAME;
  const password = process.env.PAYHERO_API_PASSWORD;

  if (!username || !password) {
    throw new Error(
      'PayHero credentials are not configured. Set PAYHERO_BASIC_AUTH_TOKEN or PAYHERO_API_USERNAME/PAYHERO_API_PASSWORD.'
    );
  }

  const credentials = Buffer
    .from(`${username}:${password}`)
    .toString('base64');

  return {
    Authorization: `Basic ${credentials}`
  };
};


// ============================================================
// NORMALIZE PHONE NUMBER
// Converts:
// 0712345678 -> 254712345678
// +254712345678 -> 254712345678
// 254712345678 -> 254712345678
// ============================================================

const normalizePhoneNumber = (phoneNumber) => {
  if (!phoneNumber) {
    return null;
  }

  let phone = String(phoneNumber)
    .trim()
    .replace(/\s+/g, '')
    .replace(/-/g, '');

  if (phone.startsWith('+254')) {
    phone = phone.substring(1);
  }

  if (phone.startsWith('07') || phone.startsWith('01')) {
    phone = '254' + phone.substring(1);
  }

  if (!phone.startsWith('254')) {
    throw new Error(
      'Invalid Kenyan phone number. Use format 07XXXXXXXX or 2547XXXXXXXX.'
    );
  }

  if (!/^254(7|1)\d{8}$/.test(phone)) {
    throw new Error('Invalid Kenyan phone number.');
  }

  return phone;
};


// ============================================================
// INITIATE PAYHERO PAYMENT
// ============================================================

const initiatePayHeroPayment = async (req, res) => {
  console.log('========================================');
  console.log('PayHero payment initiation');
  console.log('========================================');

  console.log('Request body:', req.body);

  const {
    orderId,
    amount,
    phoneNumber,
    email,
    firstName,
    lastName
  } = req.body;

  // ----------------------------------------------------------
  // Validate required fields
  // ----------------------------------------------------------

  if (!orderId || !amount || !phoneNumber) {
    return res.status(400).json({
      success: false,
      error: 'Order ID, amount and phone number are required.'
    });
  }

  // ----------------------------------------------------------
  // Validate amount
  // ----------------------------------------------------------

  const paymentAmount = Number(amount);

  if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Invalid payment amount.'
    });
  }

  // ----------------------------------------------------------
  // Normalize phone
  // ----------------------------------------------------------

  let phone;

  try {
    phone = normalizePhoneNumber(phoneNumber);
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }

  try {
    // --------------------------------------------------------
    // Check order exists
    // --------------------------------------------------------

    const orderResult = await pool.query(
      'SELECT * FROM orders WHERE id = $1',
      [orderId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Order not found.'
      });
    }

    const order = orderResult.rows[0];

    // --------------------------------------------------------
    // Prevent duplicate payment
    // --------------------------------------------------------

    if (order.payment_status === 'paid') {
      return res.status(400).json({
        success: false,
        error: 'This order has already been paid.'
      });
    }

    // --------------------------------------------------------
    // Generate unique reference
    // --------------------------------------------------------

    const trackingId = generateOrderTrackingId();

    console.log('Tracking ID:', trackingId);
    console.log('Phone:', phone);
    console.log('Amount:', paymentAmount);

    // --------------------------------------------------------
    // Check PayHero configuration
    // --------------------------------------------------------

    const channelId = process.env.PAYHERO_CHANNEL_ID;

    if (!channelId) {
      throw new Error(
        'PAYHERO_CHANNEL_ID is not configured on the server.'
      );
    }

    // --------------------------------------------------------
    // Save pending payment BEFORE calling PayHero
    // --------------------------------------------------------

    await pool.query(
      `INSERT INTO payments
       (
         order_id,
         amount,
         payment_method,
         reference,
         status,
         tracking_id,
         created_at,
         updated_at
       )
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
      [
        orderId,
        paymentAmount,
        'PAYHERO',
        trackingId,
        'pending',
        trackingId
      ]
    );

    await pool.query(
      `UPDATE orders
       SET payment_reference = $1
       WHERE id = $2`,
      [trackingId, orderId]
    );

    console.log('Pending payment saved.');

    // --------------------------------------------------------
    // PayHero STK Push
    // --------------------------------------------------------

    const payheroPayload = {
      amount: Math.round(paymentAmount),
      phone_number: phone,
      channel_id: channelId,
      external_reference: trackingId,
      customer_name:
        `${firstName || ''} ${lastName || ''}`.trim() ||
        email ||
        'Customer',
      callback_url: PAYHERO_IPN_URL
    };

    console.log('Sending STK Push to PayHero...');

    console.log('PayHero payload:', {
      ...payheroPayload,
      // Do not expose sensitive information unnecessarily
    });

    const payheroResponse = await axios.post(
      `${PAYHERO_API_BASE_URL}/payments`,
      payheroPayload,
      {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    console.log('PayHero response:', payheroResponse.data);

    // --------------------------------------------------------
    // Extract transaction information
    // --------------------------------------------------------

    const payheroData = payheroResponse.data || {};

    const transactionReference =
      payheroData.reference ||
      payheroData.transaction_id ||
      payheroData.transactionId ||
      trackingId;

    // --------------------------------------------------------
    // Update payment with PayHero reference
    // --------------------------------------------------------

    await pool.query(
      `UPDATE payments
       SET reference = $1,
           updated_at = NOW()
       WHERE tracking_id = $2`,
      [transactionReference, trackingId]
    );

    // --------------------------------------------------------
    // Return success to frontend
    // --------------------------------------------------------

    return res.status(200).json({
      success: true,
      message: 'Payment request sent. Please check your phone for the M-Pesa prompt.',

      tracking_id: trackingId,

      transaction_id:
        payheroData.transaction_id ||
        payheroData.transactionId ||
        null,

      reference: transactionReference,

      redirect_url:
        `${FRONTEND_URL}/payment-status?order_tracking_id=${encodeURIComponent(
          trackingId
        )}`
    });

  } catch (error) {

    console.error('========================================');
    console.error('PAYHERO PAYMENT ERROR');
    console.error('========================================');

    if (error.response) {
      console.error(
        'PayHero status:',
        error.response.status
      );

      console.error(
        'PayHero response:',
        error.response.data
      );
    } else {
      console.error(error.message);
    }

    // --------------------------------------------------------
    // Mark payment as failed if we created it
    // --------------------------------------------------------

    try {
      await pool.query(
        `UPDATE payments
         SET status = 'failed',
             updated_at = NOW()
         WHERE reference = $1
            OR tracking_id = $1`,
        [req.body?.trackingId || '']
      );
    } catch (dbError) {
      console.error(
        'Failed to update failed payment:',
        dbError.message
      );
    }

    return res.status(500).json({
      success: false,
      error:
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Payment initiation failed.'
    });
  }
};


// ============================================================
// PAYHERO IPN / CALLBACK
// ============================================================

const handlePayHeroIPN = async (req, res) => {

  console.log('========================================');
  console.log('PAYHERO IPN RECEIVED');
  console.log('========================================');

  console.log('PayHero callback body:', req.body);

  try {

    const data = req.body || {};

    const transactionId =
      data.transaction_id ||
      data.transactionId ||
      data.id ||
      null;

    const reference =
      data.external_reference ||
      data.reference ||
      data.externalReference ||
      null;

    const status = String(
      data.status || ''
    ).toUpperCase();

    console.log('Transaction ID:', transactionId);
    console.log('Reference:', reference);
    console.log('Status:', status);

    if (!reference && !transactionId) {
      console.error('No transaction reference received.');

      return res.status(400).json({
        status: 'ERROR',
        message: 'Missing transaction reference.'
      });
    }

    // --------------------------------------------------------
    // Find payment
    // --------------------------------------------------------

    const paymentResult = await pool.query(
      `SELECT *
       FROM payments
       WHERE reference = $1
          OR tracking_id = $1
       LIMIT 1`,
      [reference || transactionId]
    );

    if (paymentResult.rows.length === 0) {

      console.warn(
        'Payment not found for:',
        reference || transactionId
      );

      // Return 200 so PayHero doesn't repeatedly retry
      return res.status(200).json({
        status: 'OK',
        message: 'Callback received but payment was not found.'
      });
    }

    const payment = paymentResult.rows[0];

    // --------------------------------------------------------
    // Determine payment status
    // --------------------------------------------------------

    let paymentStatus;

    if (
      status === 'COMPLETED' ||
      status === 'SUCCESS' ||
      status === 'SUCCESSFUL'
    ) {

      paymentStatus = 'completed';

    } else if (
      status === 'FAILED' ||
      status === 'CANCELLED' ||
      status === 'CANCELED'
    ) {

      paymentStatus = 'failed';

    } else {

      paymentStatus = 'pending';
    }

    console.log(
      `Payment ${payment.id} → ${paymentStatus}`
    );

    // --------------------------------------------------------
    // Update payment
    // --------------------------------------------------------

    await pool.query(
      `UPDATE payments
       SET status = $1,
           updated_at = NOW()
       WHERE id = $2`,
      [
        paymentStatus,
        payment.id
      ]
    );

    // --------------------------------------------------------
    // If payment completed, update order
    // --------------------------------------------------------

    if (paymentStatus === 'completed') {

      await pool.query(
        `UPDATE orders
         SET payment_status = 'paid',
             status = 'processing'
         WHERE id = $1`,
        [payment.order_id]
      );

      console.log(
        `Order ${payment.order_id} marked as PAID.`
      );
    }

    // --------------------------------------------------------
    // If payment failed
    // --------------------------------------------------------

    if (paymentStatus === 'failed') {

      await pool.query(
        `UPDATE orders
         SET payment_status = 'failed'
         WHERE id = $1`,
        [payment.order_id]
      );

      console.log(
        `Order ${payment.order_id} marked as PAYMENT FAILED.`
      );
    }

    // --------------------------------------------------------
    // Always acknowledge PayHero
    // --------------------------------------------------------

    return res.status(200).json({
      status: 'OK'
    });

  } catch (error) {

    console.error(
      'PayHero IPN processing error:',
      error
    );

    return res.status(500).json({
      status: 'ERROR',
      error: 'IPN processing failed.'
    });
  }
};


// ============================================================
// VERIFY PAYMENT STATUS
// ============================================================

const verifyPayHeroPayment = async (req, res) => {

  const { tracking_id } = req.params;

  console.log(
    'Verifying payment:',
    tracking_id
  );

  if (!tracking_id) {
    return res.status(400).json({
      success: false,
      error: 'Tracking ID is required.'
    });
  }

  try {

    const paymentResult = await pool.query(
      `SELECT *
       FROM payments
       WHERE tracking_id = $1
          OR reference = $1
       LIMIT 1`,
      [tracking_id]
    );

    if (paymentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found.'
      });
    }

    const payment = paymentResult.rows[0];

    // --------------------------------------------------------
    // IMPORTANT:
    // No fake auto-completion here.
    // --------------------------------------------------------

    return res.status(200).json({
      success: true,
      payment: {
        id: payment.id,
        order_id: payment.order_id,
        amount: payment.amount,
        status: payment.status,
        reference: payment.reference,
        tracking_id: payment.tracking_id,
        created_at: payment.created_at,
        updated_at: payment.updated_at
      }
    });

  } catch (error) {

    console.error(
      'Verify payment error:',
      error
    );

    return res.status(500).json({
      success: false,
      error: 'Failed to verify payment.'
    });
  }
};


// ============================================================
// EXPORT
// ============================================================

module.exports = {
  initiatePayHeroPayment,
  handlePayHeroIPN,
  verifyPayHeroPayment
};