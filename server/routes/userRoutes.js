/**
 * /api/users — authenticated profile.
 * Password validation applied to password change operations.
 */
import { Router } from 'express';
import { getProfile, updateProfile, changePassword } from '../controllers/userController.js';
import { verifyCognitoToken } from '../middleware/verifyCognitoToken.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { conditionalCsrfProtection } from '../middleware/csrfProtection.js';
import { createSanitizationMiddleware } from '../middleware/inputSanitizer.js';

const router = Router();

// Apply input sanitization to user data
const sanitizeUser = createSanitizationMiddleware('user');

router.use(verifyCognitoToken);

router.get('/profile', asyncHandler(getProfile));
router.patch('/profile', conditionalCsrfProtection, sanitizeUser, asyncHandler(updateProfile));
router.patch('/change-password', conditionalCsrfProtection, asyncHandler(changePassword));

export default router;
