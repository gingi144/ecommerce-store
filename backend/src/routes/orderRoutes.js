const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const authenticate = require('../middleware/auth');

// Create a new order
router.post('/', authenticate, async (req, res) => {
  console.log('Order creation started');
  console.log('User ID:', req.user.id);
  console.log('Request body:', JSON.stringify(req.body, null, 2));

  const {
    shippingAddress,
    billingAddress,
    paymentMethod,
    items,
    mpesaPhone,
    cardNumber
  } = req.body;

  if (!shippingAddress || !billingAddress || !items || items.length === 0) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const userId = req.user.id;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Verify user exists
    const userCheck = await client.query('SELECT id FROM users WHERE id = $1', [userId]);
    if (userCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate totals
    let subtotal = 0;
    for (const item of items) {
      subtotal += parseFloat(item.price) * parseInt(item.quantity);
    }

    const tax = parseFloat((subtotal * 0.08).toFixed(2));
    const shipping = 5.99;
    const total = parseFloat((subtotal + tax + shipping).toFixed(2));

    console.log('Calculated totals:', { subtotal, tax, shipping, total });

    // Generate order number
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 10000);
    const orderNumber = 'ORD-' + timestamp + '-' + random;

    // Insert order
    const orderResult = await client.query(
      `INSERT INTO orders (
        user_id, order_number, subtotal, tax_amount, shipping_amount, total_amount,
        shipping_address, billing_address, payment_method, payment_status, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id, order_number, total_amount`,
      [
        userId,
        orderNumber,
        subtotal,
        tax,
        shipping,
        total,
        shippingAddress,
        billingAddress,
        paymentMethod || 'Pending',
        'pending',
        'pending'
      ]
    );

    const order = orderResult.rows[0];
    const orderId = order.id;
    console.log('Order created with ID:', orderId);

    // Insert order items
    for (const item of items) {
      // Get product details
      const productResult = await client.query(
        'SELECT name, sku FROM products WHERE id = $1',
        [item.productId]
      );

      if (productResult.rows.length === 0) {
        throw new Error('Product ' + item.productId + ' not found');
      }

      const productName = productResult.rows[0].name;
      const sku = productResult.rows[0].sku || null;
      const price = parseFloat(item.price);
      const quantity = parseInt(item.quantity);
      const totalPrice = parseFloat((price * quantity).toFixed(2));

      await client.query(
        `INSERT INTO order_items (
          order_id, product_id, product_name, sku, quantity, price, total
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          orderId,
          item.productId,
          productName,
          sku,
          quantity,
          price,
          totalPrice
        ]
      );

      // Update stock
      await client.query(
        'UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2',
        [quantity, item.productId]
      );
    }

    // Clear cart
    const cartResult = await client.query(
      'SELECT id FROM carts WHERE user_id = $1',
      [userId]
    );

    if (cartResult.rows.length > 0) {
      await client.query(
        'DELETE FROM cart_items WHERE cart_id = $1',
        [cartResult.rows[0].id]
      );
    }

    await client.query('COMMIT');

    console.log('Order completed successfully');

    res.status(201).json({
      message: 'Order created successfully',
      id: orderId,
      order_number: orderNumber,
      total: parseFloat(order.total_amount)
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error in order creation:', error);
    res.status(500).json({
      error: 'Failed to create order',
      message: error.message
    });
  } finally {
    client.release();
  }
});

// Get user orders
router.get('/my-orders', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const isAdmin = req.user.is_admin || false;
    
    console.log('Fetching orders for user:', userId, 'isAdmin:', isAdmin);
    
    let result;
    
    if (isAdmin) {
      // Admin can see all orders
      result = await pool.query(
        `SELECT o.*, 
          COALESCE(
            (SELECT json_agg(oi ORDER BY oi.id) FROM order_items oi WHERE oi.order_id = o.id),
            '[]'::json
          ) as items
        FROM orders o 
        ORDER BY o.created_at DESC`
      );
    } else {
      // Regular user only sees their own orders
      result = await pool.query(
        `SELECT o.*, 
          COALESCE(
            (SELECT json_agg(oi ORDER BY oi.id) FROM order_items oi WHERE oi.order_id = o.id),
            '[]'::json
          ) as items
        FROM orders o 
        WHERE o.user_id = $1 
        ORDER BY o.created_at DESC`,
        [userId]
      );
    }
    
    console.log('Found', result.rows.length, 'orders');
    res.json(result.rows);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single order
router.get('/:id', authenticate, async (req, res) => {
  const orderId = req.params.id;
  const userId = req.user.id;
  const isAdmin = req.user.is_admin || false;

  console.log('Fetching order:', orderId, 'for user:', userId, 'isAdmin:', isAdmin);

  try {
    let result;
    
    if (isAdmin) {
      // Admin can see any order
      result = await pool.query(
        `SELECT o.*, 
          COALESCE(
            (SELECT json_agg(oi ORDER BY oi.id) FROM order_items oi WHERE oi.order_id = o.id),
            '[]'::json
          ) as items
        FROM orders o 
        WHERE o.id = $1`,
        [orderId]
      );
    } else {
      // Regular user can only see their own orders
      result = await pool.query(
        `SELECT o.*, 
          COALESCE(
            (SELECT json_agg(oi ORDER BY oi.id) FROM order_items oi WHERE oi.order_id = o.id),
            '[]'::json
          ) as items
        FROM orders o 
        WHERE o.id = $1 AND o.user_id = $2`,
        [orderId, userId]
      );
    }
    
    if (result.rows.length === 0) {
      console.log('Order not found for user');
      return res.status(404).json({ error: 'Order not found' });
    }
    
    console.log('Order found:', result.rows[0].order_number);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ 
      error: 'Failed to get order',
      message: error.message 
    });
  }
});

// Get order by order number (optional)
router.get('/number/:orderNumber', authenticate, async (req, res) => {
  const { orderNumber } = req.params;
  const userId = req.user.id;
  const isAdmin = req.user.is_admin || false;

  console.log('Fetching order by number:', orderNumber, 'for user:', userId);

  try {
    let result;
    
    if (isAdmin) {
      result = await pool.query(
        `SELECT o.*, 
          COALESCE(
            (SELECT json_agg(oi ORDER BY oi.id) FROM order_items oi WHERE oi.order_id = o.id),
            '[]'::json
          ) as items
        FROM orders o 
        WHERE o.order_number = $1`,
        [orderNumber]
      );
    } else {
      result = await pool.query(
        `SELECT o.*, 
          COALESCE(
            (SELECT json_agg(oi ORDER BY oi.id) FROM order_items oi WHERE oi.order_id = o.id),
            '[]'::json
          ) as items
        FROM orders o 
        WHERE o.order_number = $1 AND o.user_id = $2`,
        [orderNumber, userId]
      );
    }
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get order by number error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update order status (admin only)
router.put('/:id/status', authenticate, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const isAdmin = req.user.is_admin || false;

  if (!isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  try {
    const result = await pool.query(
      `UPDATE orders 
       SET status = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 
       RETURNING *`,
      [status, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json({
      message: 'Order status updated successfully',
      order: result.rows[0]
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Cancel order (user)
router.put('/:id/cancel', authenticate, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    // Check if order belongs to user and is cancellable
    const orderCheck = await pool.query(
      'SELECT status FROM orders WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    
    if (orderCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const currentStatus = orderCheck.rows[0].status;
    if (currentStatus === 'delivered' || currentStatus === 'cancelled') {
      return res.status(400).json({ error: 'Order cannot be cancelled' });
    }
    
    const result = await pool.query(
      `UPDATE orders 
       SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1 AND user_id = $2 
       RETURNING *`,
      [id, userId]
    );
    
    res.json({
      message: 'Order cancelled successfully',
      order: result.rows[0]
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;