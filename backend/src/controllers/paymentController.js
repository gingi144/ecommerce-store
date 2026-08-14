
const pool = require('../config/database');
const axios = require('axios');
const crypto = require('crypto');

// ============================================================
// CONFIGURATION
// ============================================================

const PAYSTACK_API_URL =
  process.env.PAYSTACK_API_URL || 'https://api.paystack.co';

const FRONTEND_URL =
  process.env.FRONTEND_URL ||
  'https://ecommerce-store-iota-tan.vercel.app';

const PAYSTACK_CALLBACK_URL =
  process.env.PAYSTACK_CALLBACK_URL ||
  `${FRONTEND_URL}/payment-status`;


// ============================================================
// GENERATE UNIQUE PAYMENT REFERENCE
// ============================================================

const generatePaymentReference = () => {
  return (
    'ORDER-' +
    Date.now() +
    '-' +
    Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase()
  );
};


// ============================================================
// PAYSTACK HEADERS
// ============================================================

const getPaystackHeaders = () => {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;

  if (!secretKey) {
    throw new Error('PAYSTACK_SECRET_KEY is not configured.');
  }

  return {
    Authorization: `Bearer ${secretKey}`,
    'Content-Type': 'application/json',
    Accept: 'application/json'
  };
};


// ============================================================
// INITIATE PAYSTACK PAYMENT
// ============================================================

const initiatePaystackPayment = async (req, res) => {
  console.log('========================================');
  console.log('PAYSTACK PAYMENT INITIATION');
  console.log('========================================');

  const {
    orderId,
    amount,
    email,
    firstName,
    lastName
  } = req.body;

  let paymentReference = null;

  // ==========================================================
  // VALIDATION
  // ==========================================================

  if (!orderId || !email) {
    return res.status(400).json({
      success: false,
      error: 'Order ID and email are required.'
    });
  }

  try {
    // ========================================================
    // GET ORDER
    // ========================================================

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

    // ========================================================
    // PREVENT DUPLICATE PAYMENT
    // ========================================================

    if (order.payment_status === 'paid') {
      return res.status(400).json({
        success: false,
        error: 'This order has already been paid.'
      });
    }

    // ========================================================
    // USE DATABASE ORDER TOTAL
    // NEVER TRUST FRONTEND AMOUNT
    // ========================================================

    const orderAmount = Number(order.total_amount);

    if (!Number.isFinite(orderAmount) || orderAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid order amount.'
      });
    }

    const finalAmount = orderAmount;

    // ========================================================
    // GENERATE PAYSTACK REFERENCE
    // ========================================================

    paymentReference = generatePaymentReference();

    console.log('Order ID:', orderId);
    console.log('Payment reference:', paymentReference);
    console.log('Amount:', finalAmount, 'KES');

    // ========================================================
    // SAVE PENDING PAYMENT
    // ========================================================

    await pool.query(
      `INSERT INTO payments
      (
        order_id,
        amount,
        payment_method,
        reference,
        status,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
      [
        orderId,
        finalAmount,
        'PAYSTACK',
        paymentReference,
        'pending'
      ]
    );

    // ========================================================
    // SAVE REFERENCE TO ORDER
    // ========================================================

    await pool.query(
      `UPDATE orders
       SET payment_reference = $1,
           updated_at = NOW()
       WHERE id = $2`,
      [
        paymentReference,
        orderId
      ]
    );

    // ========================================================
    // CUSTOMER NAME
    // ========================================================

    const customerName =
      `${firstName || ''} ${lastName || ''}`.trim() ||
      'Customer';

    // ========================================================
    // PAYSTACK USES KOBO/CENTS
    //
    // KES 1,000 -> 100000
    // ========================================================

    const amountInSubunits =
      Math.round(finalAmount * 100);

    // ========================================================
    // PAYSTACK PAYLOAD
    // ========================================================

    const paystackPayload = {
      email: email.trim(),
      amount: amountInSubunits,
      currency: 'KES',
      reference: paymentReference,
      callback_url: PAYSTACK_CALLBACK_URL,

      channels: [
        'card',
        'mobile_money',
        'bank',
        'bank_transfer',
        'ussd',
        'qr'
      ],

      metadata: {
        order_id: String(orderId),
        order_reference: paymentReference,
        customer_name: customerName,
        customer_email: email.trim()
      }
    };

    // ========================================================
    // INITIALIZE TRANSACTION
    // ========================================================

    const response = await axios.post(
      `${PAYSTACK_API_URL}/transaction/initialize`,
      paystackPayload,
      {
        headers: getPaystackHeaders(),
        timeout: 30000
      }
    );

    const paystackData = response.data;

    console.log('Paystack response:', paystackData);

    if (
      !paystackData ||
      !paystackData.status ||
      !paystackData.data
    ) {
      throw new Error(
        paystackData?.message ||
        'Paystack failed to initialize transaction.'
      );
    }

    // ========================================================
    // RETURN CHECKOUT INFORMATION
    // ========================================================

    return res.status(200).json({
      success: true,
      message: 'Paystack payment initialized successfully.',

      authorization_url:
        paystackData.data.authorization_url,

      access_code:
        paystackData.data.access_code,

      reference:
        paystackData.data.reference ||
        paymentReference
    });

  } catch (error) {
    console.error('========================================');
    console.error('PAYSTACK PAYMENT ERROR');
    console.error('========================================');

    console.error(
      error.response?.data ||
      error.message
    );

    // ========================================================
    // MARK PAYMENT FAILED
    // ========================================================

    if (paymentReference) {
      try {
        await pool.query(
          `UPDATE payments
           SET status = 'failed',
               updated_at = NOW()
           WHERE reference = $1`,
          [paymentReference]
        );
      } catch (dbError) {
        console.error(
          'Failed to update payment:',
          dbError.message
        );
      }
    }

    return res.status(500).json({
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        'Payment initialization failed.'
    });
  }
};


// ============================================================
// MARK PAYMENT AS COMPLETED
// ============================================================

const markPaymentAsCompleted = async (
  paymentId,
  orderId,
  reference
) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Lock payment row
    const paymentResult = await client.query(
      `SELECT *
       FROM payments
       WHERE id = $1
       FOR UPDATE`,
      [paymentId]
    );

    if (paymentResult.rows.length === 0) {
      throw new Error('Payment record not found.');
    }

    const payment = paymentResult.rows[0];

    // ========================================================
    // IDEMPOTENCY
    // ========================================================

    if (payment.status === 'completed') {
      await client.query('COMMIT');
      return;
    }

    // ========================================================
    // UPDATE PAYMENT
    // ========================================================

    await client.query(
      `UPDATE payments
       SET status = 'completed',
           reference = $1,
           updated_at = NOW()
       WHERE id = $2`,
      [
        reference,
        paymentId
      ]
    );

    // ========================================================
    // UPDATE ORDER
    // ========================================================

    await client.query(
      `UPDATE orders
       SET payment_status = 'paid',
           status = 'processing',
           payment_reference = $1,
           updated_at = NOW()
       WHERE id = $2`,
      [
        reference,
        orderId
      ]
    );

    await client.query('COMMIT');

    console.log(
      `Order ${orderId} marked PAID.`
    );

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};


// ============================================================
// VERIFY PAYSTACK PAYMENT
// ============================================================

const verifyPaystackPayment = async (req, res) => {
  const { reference } = req.params;

  console.log('========================================');
  console.log('PAYSTACK PAYMENT VERIFICATION');
  console.log('Reference:', reference);
  console.log('========================================');

  if (!reference) {
    return res.status(400).json({
      success: false,
      error: 'Payment reference is required.'
    });
  }

  try {
    // ========================================================
    // FIND PAYMENT
    // ========================================================

    const paymentResult = await pool.query(
      `SELECT *
       FROM payments
       WHERE reference = $1
       LIMIT 1`,
      [reference]
    );

    if (paymentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found.'
      });
    }

    const payment = paymentResult.rows[0];

    // ========================================================
    // ALREADY COMPLETED
    // ========================================================

    if (payment.status === 'completed') {
      return res.status(200).json({
        success: true,
        message: 'Payment already verified.',
        payment: {
          id: payment.id,
          order_id: payment.order_id,
          amount: payment.amount,
          status: payment.status,
          reference: payment.reference
        }
      });
    }

    // ========================================================
    // VERIFY WITH PAYSTACK
    // ========================================================

    const response = await axios.get(
      `${PAYSTACK_API_URL}/transaction/verify/${encodeURIComponent(
        reference
      )}`,
      {
        headers: getPaystackHeaders(),
        timeout: 30000
      }
    );

    const paystackResponse = response.data;

    if (
      !paystackResponse ||
      !paystackResponse.status ||
      !paystackResponse.data
    ) {
      return res.status(400).json({
        success: false,
        error:
          paystackResponse?.message ||
          'Unable to verify payment.'
      });
    }

    const transaction = paystackResponse.data;

    console.log(
      'Paystack status:',
      transaction.status
    );

    // ========================================================
    // VERIFY AMOUNT
    // ========================================================

    const expectedAmount =
      Math.round(Number(payment.amount) * 100);

    const paidAmount =
      Number(transaction.amount);

    if (paidAmount !== expectedAmount) {
      console.error('PAYMENT AMOUNT MISMATCH');

      return res.status(400).json({
        success: false,
        error:
          'Payment amount does not match the order amount.'
      });
    }

    // ========================================================
    // VERIFY CURRENCY
    // ========================================================

    if (
      transaction.currency &&
      transaction.currency !== 'KES'
    ) {
      return res.status(400).json({
        success: false,
        error: 'Invalid payment currency.'
      });
    }

    // ========================================================
    // SUCCESS
    // ========================================================

    if (transaction.status === 'success') {
      await markPaymentAsCompleted(
        payment.id,
        payment.order_id,
        transaction.reference
      );

      return res.status(200).json({
        success: true,
        message: 'Payment verified successfully.',

        payment: {
          order_id: payment.order_id,
          amount: payment.amount,
          status: 'completed',
          reference: transaction.reference
        }
      });
    }

    // ========================================================
    // NOT YET SUCCESSFUL
    // ========================================================

    return res.status(200).json({
      success: false,

      payment: {
        order_id: payment.order_id,
        amount: payment.amount,
        status: transaction.status,
        reference: transaction.reference
      }
    });

  } catch (error) {
    console.error(
      'Paystack verification error:',
      error.response?.data ||
      error.message
    );

    return res.status(500).json({
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        'Failed to verify payment.'
    });
  }
};


// ============================================================
// PAYSTACK WEBHOOK
// ============================================================

const handlePaystackWebhook = async (req, res) => {
  console.log('========================================');
  console.log('PAYSTACK WEBHOOK RECEIVED');
  console.log('========================================');

  try {
    const secretKey =
      process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
      console.error(
        'PAYSTACK_SECRET_KEY is missing.'
      );

      return res.status(500).json({
        error: 'Webhook configuration error.'
      });
    }

    const signature =
      req.headers['x-paystack-signature'];

    if (!signature) {
      return res.status(401).json({
        error: 'Missing Paystack signature.'
      });
    }

    // ========================================================
    // CREATE EXPECTED SIGNATURE
    // ========================================================

    const expectedSignature =
      crypto
        .createHmac('sha512', secretKey)
        .update(JSON.stringify(req.body))
        .digest('hex');

    // Avoid timingSafeEqual length error
    if (
      signature.length !==
      expectedSignature.length
    ) {
      return res.status(401).json({
        error: 'Invalid webhook signature.'
      });
    }

    const signaturesMatch =
      crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );

    if (!signaturesMatch) {
      return res.status(401).json({
        error: 'Invalid webhook signature.'
      });
    }

    const event = req.body || {};

    console.log(
      'Paystack event:',
      event.event
    );

    // ========================================================
    // CHARGE SUCCESS
    // ========================================================

    if (event.event === 'charge.success') {
      const transaction = event.data || {};

      const reference =
        transaction.reference;

      if (!reference) {
        return res.status(200).json({
          status: 'OK'
        });
      }

      // ======================================================
      // FIND PAYMENT
      // ======================================================

      const paymentResult =
        await pool.query(
          `SELECT *
           FROM payments
           WHERE reference = $1
           LIMIT 1`,
          [reference]
        );

      if (paymentResult.rows.length === 0) {
        console.warn(
          'Payment not found:',
          reference
        );

        return res.status(200).json({
          status: 'OK'
        });
      }

      const payment =
        paymentResult.rows[0];

      // ======================================================
      // VERIFY AMOUNT
      // ======================================================

      const expectedAmount =
        Math.round(
          Number(payment.amount) * 100
        );

      const paidAmount =
        Number(transaction.amount);

      if (expectedAmount !== paidAmount) {
        console.error(
          'Webhook payment amount mismatch.'
        );

        return res.status(400).json({
          error: 'Payment amount mismatch.'
        });
      }

      // ======================================================
      // VERIFY CURRENCY
      // ======================================================

      if (
        transaction.currency &&
        transaction.currency !== 'KES'
      ) {
        return res.status(400).json({
          error: 'Invalid payment currency.'
        });
      }

      // ======================================================
      // COMPLETE PAYMENT
      // ======================================================

      await markPaymentAsCompleted(
        payment.id,
        payment.order_id,
        reference
      );

      console.log(
        `Paystack payment ${reference} completed.`
      );
    }

    // ========================================================
    // ACKNOWLEDGE PAYSTACK
    // ========================================================

    return res.status(200).json({
      status: 'OK'
    });

  } catch (error) {
    console.error(
      'Paystack webhook error:',
      error
    );

    return res.status(500).json({
      error: 'Webhook processing failed.'
    });
  }
};


// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  initiatePaystackPayment,
  verifyPaystackPayment,
  handlePaystackWebhook
};
