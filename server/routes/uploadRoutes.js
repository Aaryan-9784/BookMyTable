/**
 * /api/upload — multipart image upload to S3 (admin only).
 */
import { Router } from 'express';
import { uploadRestaurantImage } from '../controllers/uploadController.js';
import { verifyCognitoToken } from '../middleware/verifyCognitoToken.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { uploadSingleImage } from '../middleware/uploadImage.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

router.post('/', verifyCognitoToken, requireAdmin, uploadSingleImage, asyncHandler(uploadRestaurantImage));

export default router;
