/**
 * /api/auth — Public authentication helpers (Login 2FA OTP).
 */
import { Router } from 'express';
import { sendLoginOtp, verifyLoginOtp, sendWelcome } from '../controllers/authController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

router.post('/send-login-otp', asyncHandler(sendLoginOtp));
router.post('/verify-login-otp', asyncHandler(verifyLoginOtp));
router.post('/send-welcome-email', asyncHandler(sendWelcome));

export default router;
