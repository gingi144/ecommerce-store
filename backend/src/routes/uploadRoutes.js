const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/products');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate filename WITHOUT spaces
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 10000);
    const ext = path.extname(file.originalname);
    // Remove ALL spaces and special characters from filename
    const cleanName = file.originalname
      .replace(/\s+/g, '_')        // Replace spaces with underscores
      .replace(/[^a-zA-Z0-9._-]/g, ''); // Remove special characters
    cb(null, `${timestamp}-${cleanName}`);
  }
});