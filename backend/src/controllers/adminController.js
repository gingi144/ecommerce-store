const pool = require('../config/database');
const cloudinary = require('../config/cloudinary');

// ============================================
// PRODUCT MANAGEMENT
// ============================================

// Get all products (admin)
const getAllProducts = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, c.name as category_name,
        COALESCE(
          (SELECT json_agg(pi ORDER BY pi.sort_order)
           FROM product_images pi
           WHERE pi.product_id = p.id),
          '[]'::json
        ) as images
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.created_at DESC`
    );

    console.log('Found', result.rows.length, 'products');

    res.json(result.rows);
  } catch (error) {
    console.error('Get all products error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};


// Get single product with images
const getProductById = async (req, res) => {
  const { id } = req.params;

  try {
    const productResult = await pool.query(
      `SELECT * FROM products WHERE id = $1`,
      [id]
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Product not found'
      });
    }

    const imagesResult = await pool.query(
      `SELECT *
       FROM product_images
       WHERE product_id = $1
       ORDER BY sort_order`,
      [id]
    );

    const product = productResult.rows[0];

    product.images = imagesResult.rows || [];

    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);

    res.status(500).json({
      error: 'Failed to get product'
    });
  }
};


// ============================================
// CREATE PRODUCT
// ============================================

const createProduct = async (req, res) => {
  const {
    name,
    description,
    price,
    compare_price,
    cost_price,
    sku,
    category_id,
    stock_quantity,
    is_featured,
    is_on_sale,
    sale_percentage,
    material_type,
    weight_grams,
    care_instructions,
    color_options,
    images = []
  } = req.body;

  console.log('Creating product:', {
    name,
    price,
    category_id
  });

  if (!name) {
    return res.status(400).json({
      error: 'Product name is required'
    });
  }

  if (!price) {
    return res.status(400).json({
      error: 'Product price is required'
    });
  }

  if (!category_id) {
    return res.status(400).json({
      error: 'Category is required'
    });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const result = await client.query(
      `INSERT INTO products (
        name,
        slug,
        description,
        price,
        compare_price,
        cost_price,
        sku,
        category_id,
        stock_quantity,
        is_featured,
        is_on_sale,
        sale_percentage,
        material_type,
        weight_grams,
        care_instructions,
        color_options,
        is_active
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9,
        $10, $11, $12, $13, $14, $15, $16, $17
      )
      RETURNING id`,
      [
        name,
        slug,
        description || null,
        parseFloat(price) || 0,
        compare_price ? parseFloat(compare_price) : null,
        cost_price ? parseFloat(cost_price) : null,
        sku || null,
        category_id ? parseInt(category_id) : null,
        stock_quantity ? parseInt(stock_quantity) : 0,
        is_featured || false,
        is_on_sale || false,
        sale_percentage ? parseInt(sale_percentage) : null,
        material_type || null,
        weight_grams ? parseFloat(weight_grams) : null,
        care_instructions || null,
        color_options || [],
        true
      ]
    );

    const productId = result.rows[0].id;

    console.log('Product created with ID:', productId);

    // ============================================
    // SAVE CLOUDINARY IMAGES
    // ============================================

    if (images && images.length > 0) {
      console.log(
        'Adding',
        images.length,
        'Cloudinary image(s)'
      );

      for (let i = 0; i < images.length; i++) {
        const img = images[i];

        const imageUrl = img.image_url;

        if (
          !imageUrl ||
          !imageUrl.startsWith(
            'https://res.cloudinary.com/'
          )
        ) {
          throw new Error(
            'Invalid image URL. Product images must be stored on Cloudinary.'
          );
        }

        await client.query(
          `INSERT INTO product_images (
            product_id,
            image_url,
            alt_text,
            is_primary,
            sort_order
          )
          VALUES ($1, $2, $3, $4, $5)`,
          [
            productId,
            imageUrl,
            img.alt_text || name,
            i === 0,
            i
          ]
        );

        console.log(
          `Cloudinary image ${i + 1}:`,
          imageUrl
        );
      }
    }

    await client.query('COMMIT');

    const newProduct = await client.query(
      `SELECT p.*, c.name as category_name,
        COALESCE(
          (SELECT json_agg(pi ORDER BY pi.sort_order)
           FROM product_images pi
           WHERE pi.product_id = p.id),
          '[]'::json
        ) as images
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = $1`,
      [productId]
    );

    res.status(201).json({
      message: 'Product created successfully',
      product: newProduct.rows[0]
    });

  } catch (error) {
    await client.query('ROLLBACK');

    console.error('Create product error:', error);

    if (error.code === '23505') {
      return res.status(400).json({
        error: 'A product with this name or SKU already exists'
      });
    }

    res.status(500).json({
      error:
        error.message ||
        'Failed to create product. Please try again.'
    });

  } finally {
    client.release();
  }
};


// ============================================
// UPDATE PRODUCT
// ============================================

const updateProduct = async (req, res) => {
  const { id } = req.params;

  const {
    name,
    description,
    price,
    compare_price,
    cost_price,
    sku,
    category_id,
    stock_quantity,
    is_featured,
    is_on_sale,
    sale_percentage,
    material_type,
    weight_grams,
    care_instructions,
    color_options,
    images = []
  } = req.body;

  console.log('Updating product ID:', id);

  if (!name) {
    return res.status(400).json({
      error: 'Product name is required'
    });
  }

  if (!price) {
    return res.status(400).json({
      error: 'Product price is required'
    });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const existingProduct = await client.query(
      'SELECT id FROM products WHERE id = $1',
      [id]
    );

    if (existingProduct.rows.length === 0) {
      await client.query('ROLLBACK');

      return res.status(404).json({
        error: 'Product not found'
      });
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const fields = [];
    const values = [];
    let paramCount = 1;

    const updateFields = {
      name,
      slug,
      description,
      price: parseFloat(price) || 0,
      compare_price: compare_price
        ? parseFloat(compare_price)
        : null,
      cost_price: cost_price
        ? parseFloat(cost_price)
        : null,
      sku: sku || null,
      category_id: category_id
        ? parseInt(category_id)
        : null,
      stock_quantity: stock_quantity
        ? parseInt(stock_quantity)
        : 0,
      is_featured: is_featured || false,
      is_on_sale: is_on_sale || false,
      sale_percentage: sale_percentage
        ? parseInt(sale_percentage)
        : null,
      material_type: material_type || null,
      weight_grams: weight_grams
        ? parseFloat(weight_grams)
        : null,
      care_instructions: care_instructions || null,
      color_options: color_options || []
    };

    for (const [key, value] of Object.entries(updateFields)) {
      if (value !== undefined && value !== null) {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }

    values.push(id);

    await client.query(
      `UPDATE products
       SET ${fields.join(', ')},
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount}`,
      values
    );

    // ============================================
    // UPDATE CLOUDINARY IMAGES
    // ============================================

    if (images !== undefined) {
      await client.query(
        'DELETE FROM product_images WHERE product_id = $1',
        [id]
      );

      if (images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          const img = images[i];

          const imageUrl = img.image_url;

          if (
            !imageUrl ||
            !imageUrl.startsWith(
              'https://res.cloudinary.com/'
            )
          ) {
            throw new Error(
              'Invalid image URL. Product images must be stored on Cloudinary.'
            );
          }

          await client.query(
            `INSERT INTO product_images (
              product_id,
              image_url,
              alt_text,
              is_primary,
              sort_order
            )
            VALUES ($1, $2, $3, $4, $5)`,
            [
              id,
              imageUrl,
              img.alt_text || name || 'Product',
              i === 0,
              i
            ]
          );
        }
      }
    }

    await client.query('COMMIT');

    const updatedProduct = await pool.query(
      `SELECT p.*, c.name as category_name,
        COALESCE(
          (SELECT json_agg(pi ORDER BY pi.sort_order)
           FROM product_images pi
           WHERE pi.product_id = p.id),
          '[]'::json
        ) as images
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = $1`,
      [id]
    );

    res.json({
      message: 'Product updated successfully',
      product: updatedProduct.rows[0]
    });

  } catch (error) {
    await client.query('ROLLBACK');

    console.error('Update product error:', error);

    if (error.code === '23505') {
      return res.status(400).json({
        error: 'A product with this name or SKU already exists'
      });
    }

    if (error.code === '23502') {
      return res.status(400).json({
        error: 'Missing required field'
      });
    }

    res.status(500).json({
      error:
        error.message ||
        'Failed to update product. Please try again.'
    });

  } finally {
    client.release();
  }
};


// ============================================
// DELETE PRODUCT
// ============================================

const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM products WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Product not found'
      });
    }

    res.json({
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Delete product error:', error);

    res.status(500).json({
      error: 'Failed to delete product'
    });
  }
};


// ============================================
// ORDER MANAGEMENT
// ============================================

// Get all orders (admin)
const getAllOrders = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.*, u.email, u.first_name, u.last_name,
        COALESCE(
          (SELECT json_agg(oi)
           FROM order_items oi
           WHERE oi.order_id = o.id),
          '[]'::json
        ) as items
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC`
    );

    res.json(result.rows);

  } catch (error) {
    console.error('Get all orders error:', error);

    res.status(500).json({
      error: 'Server error'
    });
  }
};


// Update order status
const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status, tracking_number } = req.body;

  try {
    const result = await pool.query(
      `UPDATE orders
       SET status = $1,
           tracking_number = COALESCE($2, tracking_number),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [
        status,
        tracking_number,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Order not found'
      });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error('Update order error:', error);

    res.status(500).json({
      error: 'Server error'
    });
  }
};


// ============================================
// DASHBOARD
// ============================================

const getDashboardStats = async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM products WHERE is_active = true) as total_products,
        (SELECT COUNT(*) FROM orders) as total_orders,
        (SELECT COUNT(*) FROM orders WHERE status = 'pending') as pending_orders,
        (SELECT COALESCE(SUM(total_amount), 0)
         FROM orders
         WHERE status = 'delivered') as total_revenue,
        (SELECT COUNT(*)
         FROM orders
         WHERE created_at >= NOW() - INTERVAL '30 days') as orders_last_30_days,
        (SELECT COUNT(*)
         FROM flash_sale_settings
         WHERE is_active = true
         AND start_time <= NOW()
         AND end_time >= NOW()) as active_flash_sales
    `);

    res.json(stats.rows[0]);

  } catch (error) {
    console.error('Get dashboard stats error:', error);

    res.status(500).json({
      error: 'Server error'
    });
  }
};


// ============================================
// CATEGORIES
// ============================================

const getCategories = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT *
       FROM categories
       WHERE is_active = true
       ORDER BY name`
    );

    res.json(result.rows);

  } catch (error) {
    console.error('Get categories error:', error);

    res.status(500).json({
      error: 'Server error'
    });
  }
};


// ============================================
// IMAGE UPLOAD → CLOUDINARY
// ============================================

const uploadImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: 'No images uploaded'
      });
    }

    console.log(
      'Uploading',
      req.files.length,
      'image(s) to Cloudinary...'
    );

    const uploadedImages = [];

    for (const file of req.files) {

      const result = await new Promise(
        (resolve, reject) => {

          const uploadStream =
            cloudinary.uploader.upload_stream(
              {
                folder: 'stara-crochet/products',
                resource_type: 'image',

                // ========================================
                // AUTOMATIC IMAGE OPTIMIZATION
                // ========================================

                transformation: [
                  {
                    width: 1200,
                    height: 1200,
                    crop: 'limit',
                    quality: 'auto:good',
                    fetch_format: 'auto'
                  }
                ]
              },
              (error, result) => {
                if (error) {
                  reject(error);
                } else {
                  resolve(result);
                }
              }
            );

          uploadStream.end(file.buffer);
        }
      );

      console.log(
        'Cloudinary upload successful:',
        result.public_id
      );

      console.log(
        'Original file:',
        file.originalname,
        'size:',
        Math.round(file.size / 1024),
        'KB'
      );

      uploadedImages.push({
        image_url: result.secure_url,
        alt_text: file.originalname,
        public_id: result.public_id
      });
    }

    console.log(
      'Cloudinary upload complete:',
      uploadedImages.length,
      'optimized image(s)'
    );

    return res.status(200).json(
      uploadedImages
    );

  } catch (error) {

    console.error(
      'Cloudinary upload error:',
      error
    );

    return res.status(500).json({
      error: 'Failed to upload images to Cloudinary',
      details: error.message
    });
  }
};


// ============================================
// FLASH SALE
// ============================================

// Get flash sale settings
const getFlashSaleSettings = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT *
       FROM flash_sale_settings
       WHERE is_active = true
       ORDER BY id DESC
       LIMIT 1`
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
    console.error(
      'Get flash sale settings error:',
      error
    );

    res.status(500).json({
      error: 'Server error'
    });
  }
};


// Get flash sale products
const getFlashSaleProducts = async (req, res) => {
  try {
    const settingsResult = await pool.query(
      `SELECT *
       FROM flash_sale_settings
       WHERE is_active = true
       ORDER BY id DESC
       LIMIT 1`
    );

    if (
      settingsResult.rows.length === 0 ||
      !settingsResult.rows[0].is_active
    ) {
      return res.json([]);
    }

    const settings = settingsResult.rows[0];

    const discountPercentage =
      settings.discount_percentage || 0;

    const result = await pool.query(
      `SELECT p.*, c.name as category_name,
        COALESCE(
          (SELECT json_agg(pi ORDER BY pi.sort_order)
           FROM product_images pi
           WHERE pi.product_id = p.id),
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
    console.error(
      'Get flash sale products error:',
      error
    );

    res.status(500).json({
      error: 'Server error'
    });
  }
};


// ============================================
// USER MANAGEMENT
// ============================================

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        id,
        username,
        email,
        first_name,
        last_name,
        phone,
        address,
        city,
        county,
        is_admin,
        created_at,
        updated_at
       FROM users
       ORDER BY created_at DESC`
    );

    console.log(
      'Found',
      result.rows.length,
      'users'
    );

    res.json(result.rows);

  } catch (error) {
    console.error('Get all users error:', error);

    res.status(500).json({
      error: 'Server error'
    });
  }
};


// Update user role
const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { is_admin } = req.body;

  try {

    const check = await pool.query(
      'SELECT id FROM users WHERE id = $1',
      [id]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        error: 'Cannot modify your own role'
      });
    }

    const result = await pool.query(
      `UPDATE users
       SET is_admin = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, username, email, is_admin`,
      [
        is_admin,
        id
      ]
    );

    res.json({
      message: 'User role updated successfully',
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Update user role error:', error);

    res.status(500).json({
      error: 'Server error'
    });
  }
};


// Delete user
const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {

    const check = await pool.query(
      'SELECT id FROM users WHERE id = $1',
      [id]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        error: 'Cannot delete your own account'
      });
    }

    await pool.query(
      'DELETE FROM users WHERE id = $1',
      [id]
    );

    res.json({
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);

    res.status(500).json({
      error: 'Server error'
    });
  }
};


// ============================================
// EXPORTS
// ============================================

module.exports = {

  // Products
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,

  // Orders
  getAllOrders,
  updateOrderStatus,

  // Dashboard
  getDashboardStats,

  // Categories
  getCategories,

  // Images
  uploadImages,

  // Flash Sale
  getFlashSaleSettings,
  getFlashSaleProducts,

  // Users
  getAllUsers,
  updateUserRole,
  deleteUser
};