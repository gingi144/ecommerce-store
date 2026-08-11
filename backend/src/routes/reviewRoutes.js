const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const authenticate = require('../middleware/auth');

// Get reviews for a product
router.get('/product/:productId', async (req, res) => {
  const { productId } = req.params;
  
  try {
    const result = await pool.query(
      `SELECT r.*, u.username, u.first_name, u.last_name
       FROM reviews r
       LEFT JOIN users u ON r.user_id = u.id
       WHERE r.product_id = $1 AND r.is_approved = true
       ORDER BY r.created_at DESC`,
      [productId]
    );
    
    // Get average rating
    const avgResult = await pool.query(
      'SELECT AVG(rating) as average, COUNT(*) as count FROM reviews WHERE product_id = $1 AND is_approved = true',
      [productId]
    );
    
    res.json({
      reviews: result.rows,
      average: parseFloat(avgResult.rows[0].average) || 0,
      count: parseInt(avgResult.rows[0].count) || 0
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add review for a product (after purchase)
router.post('/product/:productId', authenticate, async (req, res) => {
  const { productId } = req.params;
  const { rating, title, comment, orderId } = req.body;
  const userId = req.user.id;

  try {
    // Check if user has purchased this product
    const orderCheck = await pool.query(
      `SELECT oi.id FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       WHERE oi.product_id = $1 AND o.user_id = $2 AND o.status = 'delivered'`,
      [productId, userId]
    );
    
    // Allow review even if not delivered (for testing)
    // Remove this check for production if you want to allow reviews only after delivery
    
    // Check if user already reviewed this product
    const existingReview = await pool.query(
      'SELECT id FROM reviews WHERE product_id = $1 AND user_id = $2',
      [productId, userId]
    );
    
    if (existingReview.rows.length > 0) {
      return res.status(400).json({ error: 'You have already reviewed this product' });
    }
    
    const result = await pool.query(
      `INSERT INTO reviews (product_id, user_id, rating, title, comment, order_id, is_approved)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [productId, userId, rating, title, comment, orderId || null, true] // Auto-approve for now
    );
    
    res.status(201).json({
      message: 'Review added successfully',
      review: result.rows[0]
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ error: 'Failed to add review' });
  }
});

// Get user's reviews
router.get('/my-reviews', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.*, p.name as product_name, p.slug
       FROM reviews r
       JOIN products p ON r.product_id = p.id
       WHERE r.user_id = $1
       ORDER BY r.created_at DESC`,
      [req.user.id]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;