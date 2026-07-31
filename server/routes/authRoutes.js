/**
 * /api/auth — Public authentication helpers (Login 2FA OTP).
 */
import { Router } from 'express';
import { sendLoginOtp, verifyLoginOtp } from '../controllers/authController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

router.post('/send-login-otp', asyncHandler(sendLoginOtp));
router.post('/verify-login-otp', asyncHandler(verifyLoginOtp));

export default router;
