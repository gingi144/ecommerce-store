const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Get flash sale settings
router.get('/settings', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM flash_sale_settings WHERE is_active = true ORDER BY id DESC LIMIT 1`
    );
    
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.json({
        is_active: false,
        start_time: null,
        end_time: null,
        discount_percentage: 0
      });
    }
  } catch (error) {
    console.error('Get flash sale settings error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get flash sale products
router.get('/products', async (req, res) => {
  try {
    const settingsResult = await pool.query(
      `SELECT * FROM flash_sale_settings WHERE is_active = true ORDER BY id DESC LIMIT 1`
    );
    
    if (settingsResult.rows.length === 0 || !settingsResult.rows[0].is_active) {
      return res.json([]);
    }
    
    const settings = settingsResult.rows[0];
    const discountPercentage = settings.discount_percentage || 0;
    
    const result = await pool.query(
      `SELECT p.*, c.name as category_name,
        COALESCE(
          (SELECT json_agg(pi ORDER BY pi.sort_order) FROM product_images pi WHERE pi.product_id = p.id),
          '[]'::json
        ) as images
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.is_active = true 
        AND p.is_on_sale = true
      ORDER BY p.created_at DESC
      LIMIT 10`
    );
    
    const products = result.rows.map(product => ({
      ...product,
      flash_sale_discount: discountPercentage,
      flash_sale_start: settings.start_time,
      flash_sale_end: settings.end_time
    }));
    
    res.json(products);
  } catch (error) {
    console.error('Get flash sale products error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;