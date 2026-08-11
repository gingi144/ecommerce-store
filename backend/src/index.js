const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const adminRoutes = require('./routes/adminRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reviewRoutes = require('./routes/reviewRoutes');



const app = express();
const PORT = process.env.PORT || 5000;

// ===========================
// Middleware
// ===========================
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(compression());

// FIXED CORS - Allow all origins for development
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ===========================
// Uploads Directory
// ===========================

// Check both possible uploads locations
const uploadsPaths = [
  path.join(__dirname, 'uploads'),      // src/uploads
  path.join(__dirname, '../uploads')    // root/uploads
];

let activeUploadsPath = null;

for (const uploadPath of uploadsPaths) {
  if (fs.existsSync(uploadPath)) {
    activeUploadsPath = uploadPath;
    console.log('Found uploads at:', uploadPath);
    break;
  }
}

// If no uploads folder exists, create one in src
if (!activeUploadsPath) {
  activeUploadsPath = path.join(__dirname, 'uploads');
  fs.mkdirSync(activeUploadsPath, { recursive: true });
  console.log('Created uploads directory at:', activeUploadsPath);
}

// Ensure products subdirectory exists
const productsUploadDir = path.join(activeUploadsPath, 'products');
if (!fs.existsSync(productsUploadDir)) {
  fs.mkdirSync(productsUploadDir, { recursive: true });
  console.log('Created products directory at:', productsUploadDir);
}

// List files in products directory for debugging
try {
  const files = fs.readdirSync(productsUploadDir);
  console.log('Files in products directory:', files.length > 0 ? files.join(', ') : '(empty)');
} catch (err) {
  console.log('Could not read products directory:', err.message);
}

// Serve uploaded files with proper CORS headers
app.use('/uploads', (req, res, next) => {
  // Decode URL to handle spaces and special characters
  req.url = decodeURIComponent(req.url);
  next();
}, express.static(activeUploadsPath, {
  setHeaders: (res, filePath) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    // Set proper content type for images
    if (filePath.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      res.setHeader('Content-Type', 'image/' + path.extname(filePath).substring(1));
    }
  }
}));

// Additional static serving from root uploads as fallback
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ===========================
// API Routes
// ===========================
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);

// ===========================
// Flash Sale Routes (inline to avoid file dependency)
// ===========================
const pool = require('./config/database');

// Get flash sale settings
app.get('/api/flash-sale/settings', async (req, res) => {
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
app.get('/api/flash-sale/products', async (req, res) => {
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

// ===========================
// Health Check
// ===========================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uploadsPath: activeUploadsPath
  });
});

// ===========================
// 404 Handler
// ===========================
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: 'Cannot ' + req.method + ' ' + req.originalUrl
  });
});

// ===========================
// Global Error Handler
// ===========================
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  console.error('Stack:', err.stack);

  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong.'
  });
});

// ===========================
// Start Server
// ===========================
app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('Crochet Store API');
  console.log('='.repeat(60));
  console.log('Server: http://localhost:' + PORT);
  console.log('Uploads: ' + activeUploadsPath);
  console.log('Static URL: http://localhost:' + PORT + '/uploads');
  console.log('Health: http://localhost:' + PORT + '/api/health');
  console.log('Environment: ' + (process.env.NODE_ENV || 'development'));
  console.log('='.repeat(60));
});

// ===========================
// Process Handlers
// ===========================
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});