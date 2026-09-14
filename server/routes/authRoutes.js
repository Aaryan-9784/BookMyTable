/**
 * /api/auth — MongoDB Authentication & Verification Routes.
 * Protected with strict rate limiting to prevent brute force attacks.
 * Input sanitization applied to email addresses and user data.
 */
import { Router } from 'express';
import {
  register,
  login,
  resetPassword,
  sendLoginOtp,
  verifyLoginOtp,
  sendWelcome,
} from '../controllers/authController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { authLimiter, otpLimiter } from '../middleware/rateLimiter.js';
import { sendCsrfToken } from '../middleware/csrfProtection.js';
import { createSanitizationMiddleware } from '../middleware/inputSanitizer.js';

const router = Router();

// Input sanitization for user data
const sanitizeUser = createSanitizationMiddleware('user');

// Get CSRF token for authenticated operations
router.get('/csrf-token', sendCsrfToken);

// Core Authentication
router.post('/register', authLimiter, sanitizeUser, asyncHandler(register));
router.post('/signup', authLimiter, sanitizeUser, asyncHandler(register));
router.post('/login', authLimiter, sanitizeUser, asyncHandler(login));
router.post('/reset-password', authLimiter, sanitizeUser, asyncHandler(resetPassword));

// OTP Verification & Welcome Email
router.post('/send-login-otp', otpLimiter, sanitizeUser, asyncHandler(sendLoginOtp));
router.post('/verify-login-otp', authLimiter, sanitizeUser, asyncHandler(verifyLoginOtp));
router.post('/send-welcome-email', otpLimiter, sanitizeUser, asyncHandler(sendWelcome));

export default router;
