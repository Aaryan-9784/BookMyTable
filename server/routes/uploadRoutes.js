/**
 * /api/upload — multipart image upload to S3 (admin & restaurant partner allowed).
 */
import { Router } from 'express';
import { uploadRestaurantImage } from '../controllers/uploadController.js';
import { verifyCognitoToken } from '../middleware/verifyCognitoToken.js';
import { requireRole } from '../middleware/requireRole.js';
import { uploadSingleImage } from '../middleware/uploadImage.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

router.post('/', verifyCognitoToken, requireRole(['admin', 'restaurant']), uploadSingleImage, asyncHandler(uploadRestaurantImage));

export default router;
