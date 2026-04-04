/**
 * /api/users — authenticated profile.
 */
import { Router } from 'express';
import { getProfile } from '../controllers/userController.js';
import { verifyCognitoToken } from '../middleware/verifyCognitoToken.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

router.use(verifyCognitoToken);

router.get('/profile', asyncHandler(getProfile));

export default router;
