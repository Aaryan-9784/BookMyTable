/**
 * Accepts multipart file field "image", uploads to S3, returns { url } for restaurant.imageUrl.
 */
import { randomUUID } from 'crypto';
import path from 'path';
import { uploadBufferToS3 } from '../utils/s3Upload.js';

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

    const ext = extFromMime[req.file.mimetype] || path.extname(req.file.originalname) || '.bin';
    const key = `restaurants/${randomUUID()}${ext}`;

    const url = await uploadBufferToS3(req.file.buffer, key, req.file.mimetype);
    res.status(201).json({ url, key });
  } catch (e) {
    next(e);
  }
}
