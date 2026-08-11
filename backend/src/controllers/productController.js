const pool = require('../config/database');

// Get all products with filters
const getProducts = async (req, res) => {
  const { 
    category, 
    minPrice, 
    maxPrice, 
    search, 
    sort = 'newest', 
    page = 1, 
    limit = 20,
    featured,
    onSale
  } = req.query;

  console.log('📝 Products request with filters:', req.query);

  try {
    let query = `
      SELECT p.*, 
        c.name as category_name,
        c.slug as category_slug,
        (SELECT json_agg(pi) FROM product_images pi WHERE pi.product_id = p.id AND pi.is_primary = true) as images
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.is_active = true
    `;
    const params = [];
    let paramCount = 1;

    if (category) {
      query += ` AND c.slug = $${paramCount}`;
      params.push(category);
      paramCount++;
    }

    if (minPrice) {
      query += ` AND p.price >= $${paramCount}`;
      params.push(parseFloat(minPrice));
      paramCount++;
    }

    if (maxPrice) {
      query += ` AND p.price <= $${paramCount}`;
      params.push(parseFloat(maxPrice));
      paramCount++;
    }

    if (search) {
      query += ` AND (p.name ILIKE $${paramCount} OR p.description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    if (featured === 'true') {
      query += ` AND p.is_featured = true`;
    }

    if (onSale === 'true') {
      query += ` AND p.is_on_sale = true`;
    }

    // Sorting
    const sortOptions = {
      'price_asc': 'p.price ASC',
      'price_desc': 'p.price DESC',
      'newest': 'p.created_at DESC',
      'popular': 'p.sales_count DESC',
      'name': 'p.name ASC'
    };
    query += ` ORDER BY ${sortOptions[sort] || 'p.created_at DESC'}`;

    // Pagination
    const offset = (page - 1) * limit;
    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    console.log('📝 SQL Query:', query);
    console.log('📝 Parameters:', params);

    const result = await pool.query(query, params);
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM products p WHERE p.is_active = true';
    const countParams = [];
    let countParamCount = 1;
    
    if (category) {
      countQuery += ` AND p.category_id = (SELECT id FROM categories WHERE slug = $${countParamCount})`;
      countParams.push(category);
      countParamCount++;
    }
    
    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    console.log(`✅ Found ${result.rows.length} products out of ${total} total`);

    res.json({
      products: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('❌ Get products error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get single product by slug
const getProductBySlug = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, 
        c.name as category_name,
        (SELECT json_agg(pi ORDER BY pi.sort_order) FROM product_images pi WHERE pi.product_id = p.id) as images,
        (SELECT json_agg(r) FROM reviews r WHERE r.product_id = p.id AND r.is_approved = true) as reviews,
        (SELECT AVG(rating) FROM reviews r WHERE r.product_id = p.id AND r.is_approved = true) as average_rating,
        (SELECT COUNT(*) FROM reviews r WHERE r.product_id = p.id AND r.is_approved = true) as review_count
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.slug = $1 AND p.is_active = true`,
      [req.params.slug]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Get product error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get related products
const getRelatedProducts = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `SELECT p.*, 
        (SELECT json_agg(pi) FROM product_images pi WHERE pi.product_id = p.id AND pi.is_primary = true) as images
      FROM products p 
      WHERE p.category_id = (SELECT category_id FROM products WHERE id = $1)
      AND p.id != $1
      AND p.is_active = true
      LIMIT 4`,
      [id]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error(' Get related products error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getProducts,
  getProductBySlug,
  getRelatedProducts
};