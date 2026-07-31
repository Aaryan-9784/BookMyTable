/**
 * Accepts multipart file field "image", uploads to Cloudinary, returns { url } for restaurant.imageUrl.
 */
import { randomUUID } from 'crypto';
import path from 'path';
import { uploadBufferToCloudinary } from '../utils/cloudinaryUpload.js';

const extFromMime = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

/**
 * POST /api/upload — admin only; body: multipart/form-data with field name `image`.
 */
export async function uploadRestaurantImage(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'File field "image" is required' });
    }

    const ext = extFromMime[req.file.mimetype] || path.extname(req.file.originalname) || '.jpg';
    const filename = `restaurant_${randomUUID()}${ext}`;

    const url = await uploadBufferToCloudinary(req.file.buffer, filename, 'restaurants');
    res.status(201).json({ url, key: filename });
  } catch (e) {
    next(e);
  }
}
