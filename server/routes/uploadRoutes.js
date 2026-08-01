/**
 * /api/upload — multipart image upload to S3 (admin & restaurant partner allowed).
 * Protected with rate limiting to prevent upload abuse.
 * CSRF protection to prevent unauthorized uploads.
 */
import { Router } from 'express';
import { uploadRestaurantImage } from '../controllers/uploadController.js';
import { verifyCognitoToken } from '../middleware/verifyCognitoToken.js';
import { requireRole } from '../middleware/requireRole.js';
import { uploadSingleImage } from '../middleware/uploadImage.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { uploadLimiter } from '../middleware/rateLimiter.js';
import { conditionalCsrfProtection } from '../middleware/csrfProtection.js';

const router = Router();

// Rate limit: 20 uploads per hour per IP + CSRF protection
router.post(
  '/',
  uploadLimiter,
  conditionalCsrfProtection,
  verifyCognitoToken,
  requireRole(['admin', 'restaurant']),
  uploadSingleImage,
  asyncHandler(uploadRestaurantImage)
);

export default router;
