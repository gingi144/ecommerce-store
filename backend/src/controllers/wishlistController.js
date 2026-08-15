const pool = require('../config/database');

// ============================================================
// GET USER WISHLIST
// ============================================================

const getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT
        w.id,
        w.user_id,
        w.product_id,
        w.created_at,
        p.name,
        p.price,
        p.description,
        p.stock_quantity,
        p.is_active,

        COALESCE(
          (
            SELECT json_agg(pi ORDER BY pi.sort_order)
            FROM product_images pi
            WHERE pi.product_id = p.id
          ),
          '[]'::json
        ) AS images

      FROM wishlists w
      INNER JOIN products p
        ON p.id = w.product_id

      WHERE w.user_id = $1

      ORDER BY w.created_at DESC`,
      [userId]
    );

    res.status(200).json(result.rows);

  } catch (error) {
    console.error('Get wishlist error:', error);

    res.status(500).json({
      success: false,
      error: 'Failed to fetch wishlist.'
    });
  }
};


// ============================================================
// ADD PRODUCT TO WISHLIST
// ============================================================

const addToWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { product_id, productId } = req.body;

    const finalProductId = product_id || productId;

    if (!finalProductId) {
      return res.status(400).json({
        success: false,
        error: 'Product ID is required.'
      });
    }

    // Check product exists
    const productResult = await pool.query(
      `SELECT id
       FROM products
       WHERE id = $1`,
      [finalProductId]
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Product not found.'
      });
    }

    // Check if already exists
    const existingResult = await pool.query(
      `SELECT id
       FROM wishlists
       WHERE user_id = $1
         AND product_id = $2`,
      [userId, finalProductId]
    );

    if (existingResult.rows.length > 0) {
      return res.status(200).json({
        success: true,
        message: 'Product is already in your wishlist.'
      });
    }

    const result = await pool.query(
      `INSERT INTO wishlists
        (user_id, product_id, created_at)
       VALUES ($1, $2, NOW())
       RETURNING *`,
      [userId, finalProductId]
    );

    res.status(201).json({
      success: true,
      message: 'Product added to wishlist.',
      wishlist: result.rows[0]
    });

  } catch (error) {
    console.error('Add wishlist error:', error);

    res.status(500).json({
      success: false,
      error: 'Failed to add product to wishlist.'
    });
  }
};


// ============================================================
// REMOVE PRODUCT FROM WISHLIST
// ============================================================

const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    const productId =
      req.params.productId ||
      req.params.product_id;

    if (!productId) {
      return res.status(400).json({
        success: false,
        error: 'Product ID is required.'
      });
    }

    const result = await pool.query(
      `DELETE FROM wishlists
       WHERE user_id = $1
         AND product_id = $2
       RETURNING *`,
      [userId, productId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Product was not found in your wishlist.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product removed from wishlist.'
    });

  } catch (error) {
    console.error('Remove wishlist error:', error);

    res.status(500).json({
      success: false,
      error: 'Failed to remove product from wishlist.'
    });
  }
};


// ============================================================
// CHECK IF PRODUCT IS IN WISHLIST
// ============================================================

const checkWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    const productId =
      req.params.productId ||
      req.params.product_id;

    if (!productId) {
      return res.status(400).json({
        success: false,
        error: 'Product ID is required.'
      });
    }

    const result = await pool.query(
      `SELECT id
       FROM wishlists
       WHERE user_id = $1
         AND product_id = $2
       LIMIT 1`,
      [userId, productId]
    );

    res.status(200).json({
      success: true,
      inWishlist: result.rows.length > 0
    });

  } catch (error) {
    console.error('Check wishlist error:', error);

    res.status(500).json({
      success: false,
      error: 'Failed to check wishlist.'
    });
  }
};


// ============================================================
// GET WISHLIST COUNT
// ============================================================

const getWishlistCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT COUNT(*)::int AS count
       FROM wishlists
       WHERE user_id = $1`,
      [userId]
    );

    res.status(200).json({
      success: true,
      count: result.rows[0].count
    });

  } catch (error) {
    console.error('Wishlist count error:', error);

    res.status(500).json({
      success: false,
      error: 'Failed to get wishlist count.'
    });
  }
};


module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlist,
  getWishlistCount
};