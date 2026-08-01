/**
 * /api/auth — Public authentication helpers (Login 2FA OTP).
 * Protected with strict rate limiting to prevent brute force attacks.
 * Input sanitization applied to email addresses and user data.
 */
import { Router } from 'express';
import { sendLoginOtp, verifyLoginOtp, sendWelcome } from '../controllers/authController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { authLimiter, otpLimiter } from '../middleware/rateLimiter.js';
import { sendCsrfToken } from '../middleware/csrfProtection.js';
import { createSanitizationMiddleware } from '../middleware/inputSanitizer.js';

const router = Router();

// Input sanitization for user data
const sanitizeUser = createSanitizationMiddleware('user');

// Get CSRF token for authenticated operations
router.get('/csrf-token', sendCsrfToken);

// Strict rate limiting: 3 OTP requests per 15 minutes per IP+email
router.post('/send-login-otp', otpLimiter, sanitizeUser, asyncHandler(sendLoginOtp));

// Strict rate limiting: 5 verification attempts per 15 minutes per IP
router.post('/verify-login-otp', authLimiter, sanitizeUser, asyncHandler(verifyLoginOtp));

// Welcome email rate limiting
router.post('/send-welcome-email', otpLimiter, sanitizeUser, asyncHandler(sendWelcome));

export default router;
