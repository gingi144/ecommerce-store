const fs = require('fs');
const path = require('path');
const pool = require('../config/database');
const cloudinary = require('../config/cloudinary');

const UPLOADS_DIR = path.join(
  __dirname,
  '../uploads/products'
);

const isCloudinaryUrl = (url) => {
  return (
    url &&
    url.startsWith('https://res.cloudinary.com/')
  );
};

const uploadToCloudinary = (filePath) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'stara-crochet/products',
        resource_type: 'image'
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    fs.createReadStream(filePath).pipe(stream);
  });
};

const migrateImages = async () => {
  console.log('========================================');
  console.log('CLOUDINARY IMAGE MIGRATION');
  console.log('========================================');

  try {
    if (!fs.existsSync(UPLOADS_DIR)) {
      throw new Error(
        `Images directory not found: ${UPLOADS_DIR}`
      );
    }

    const files = fs
      .readdirSync(UPLOADS_DIR)
      .filter((file) => {
        const extension = path
          .extname(file)
          .toLowerCase();

        return [
          '.jpg',
          '.jpeg',
          '.png',
          '.webp',
          '.gif'
        ].includes(extension);
      });

    console.log(
      `Found ${files.length} image files.`
    );

    if (files.length === 0) {
      console.log('No images found.');
      return;
    }

    let migrated = 0;
    let skipped = 0;
    let failed = 0;

    for (const file of files) {
      console.log('');
      console.log('----------------------------------------');
      console.log(`Processing: ${file}`);

      try {
        // Existing local URL format
        const oldUrl =
          `/uploads/products/${file}`;

        // Find database record
        const result = await pool.query(
          `SELECT id, product_id, image_url
           FROM product_images
           WHERE image_url = $1
           LIMIT 1`,
          [oldUrl]
        );

        if (result.rows.length === 0) {
          console.log(
            '⚠️ No database record found. Skipping.'
          );

          skipped++;
          continue;
        }

        const image = result.rows[0];

        // Already migrated
        if (isCloudinaryUrl(image.image_url)) {
          console.log(
            '✓ Already using Cloudinary. Skipping.'
          );

          skipped++;
          continue;
        }

        const filePath = path.join(
          UPLOADS_DIR,
          file
        );

        console.log(
          'Uploading to Cloudinary...'
        );

        const cloudinaryResult =
          await uploadToCloudinary(filePath);

        console.log(
          'Cloudinary URL:',
          cloudinaryResult.secure_url
        );

        // Update production database
        await pool.query(
          `UPDATE product_images
           SET image_url = $1
           WHERE id = $2`,
          [
            cloudinaryResult.secure_url,
            image.id
          ]
        );

        console.log(
          '✓ Database updated.'
        );

        migrated++;

      } catch (error) {
        failed++;

        console.error(
          `❌ Failed: ${file}`
        );

        console.error(
          error.message
        );
      }
    }

    console.log('');
    console.log('========================================');
    console.log('MIGRATION COMPLETE');
    console.log('========================================');

    console.log(
      `Migrated: ${migrated}`
    );

    console.log(
      `Skipped: ${skipped}`
    );

    console.log(
      `Failed: ${failed}`
    );

    console.log('========================================');

  } catch (error) {
    console.error(
      'Migration error:',
      error
    );

    process.exitCode = 1;

  } finally {
    await pool.end();
  }
};

migrateImages();