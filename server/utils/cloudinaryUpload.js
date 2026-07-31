/**
 * Cloudinary Upload Utility — 100% Free CDN & Image Storage (25 GB free storage).
 * Replaces AWS S3 + CloudFront with zero credit card requirements.
 */
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary from environment variables or CLOUDINARY_URL
if (process.env.CLOUDINARY_URL) {
  cloudinary.config();
} else if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

/**
 * Upload a file buffer to Cloudinary
 * @param {Buffer} buffer File bytes
 * @param {string} filename Original filename or key
 * @param {string} folder Target folder on Cloudinary (default: 'restaurants')
 * @returns {Promise<string>} Secure HTTPS Cloudinary CDN URL
 */
export async function uploadBufferToCloudinary(buffer, filename = 'image', folder = 'restaurants') {
  const isConfigured = Boolean(
    process.env.CLOUDINARY_URL || 
    (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)
  );

  if (!isConfigured) {
    console.warn('[BookMyTable][Cloudinary] Credentials not set. Returning data URI fallback for local dev.');
    const mime = filename.endsWith('.png') ? 'image/png' : 'image/jpeg';
    return `data:${mime};base64,${buffer.toString('base64')}`;
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      },
      (error, result) => {
        if (error) {
          console.error('[BookMyTable][Cloudinary] Upload failed:', error.message);
          return reject(new Error(`Cloudinary upload failed: ${error.message}`));
        }
        console.log(`[BookMyTable][Cloudinary] Upload success: ${result.secure_url}`);
        resolve(result.secure_url);
      }
    );

    uploadStream.end(buffer);
  });
}
