/**
 * Auth Controller — Login 2FA OTP generation and verification via Resend.
 */
import { sendLoginOtpEmail, sendWelcomeEmail } from '../utils/resendEmail.js';
import { createLogger } from '../utils/logger.js';
import { generateOTP, storeOTP, verifyOTP } from '../services/otpService.js';

const logger = createLogger('Auth');

/**
 * POST /api/auth/send-login-otp
 * Body: { email }
 */
export async function sendLoginOtp(req, res, next) {
  try {
    const { email } = req.body || {};
    const normalizedEmail = (email || '').trim().toLowerCase();

    if (!normalizedEmail) {
      return res.status(400).json({ message: 'Email address is required' });
    }

    // Generate OTP code
    const otpCode = generateOTP();

    // Store OTP in Redis (or memory fallback)
    const stored = await storeOTP(normalizedEmail, otpCode);

    logger.info('Login OTP generated and stored', { 
      email: normalizedEmail, 
      method: stored.method,
      expiresIn: `${stored.expiresIn} seconds`
    });

    // Send email via Resend
    const delivery = await sendLoginOtpEmail({ toEmail: normalizedEmail, otpCode });

    res.json({
      ok: true,
      message: 'Verification code sent to email',
      expiresIn: stored.expiresIn,
      delivery,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/verify-login-otp
 * Body: { email, code }
 */
export async function verifyLoginOtp(req, res, next) {
  try {
    const { email, code } = req.body || {};
    const normalizedEmail = (email || '').trim().toLowerCase();
    const inputCode = (code || '').trim();

    if (!normalizedEmail || !inputCode) {
      return res.status(400).json({ message: 'Email and verification code are required' });
    }

    // Development bypass: only enabled if explicitly configured in environment
    const isDevelopment = process.env.NODE_ENV !== 'production';
    const bypassEnabled = process.env.DEV_OTP_BYPASS === 'true';
    const bypassCode = process.env.DEV_OTP_BYPASS_CODE;
    const isDevBypass = isDevelopment && bypassEnabled && bypassCode && inputCode === bypassCode;

    if (isDevBypass) {
      logger.warn('OTP verification bypassed (development mode)', { email: normalizedEmail });
      return res.json({
        ok: true,
        message: 'OTP verified successfully (development bypass)',
        bypass: true,
      });
    }

    // Verify OTP using Redis-backed service
    const verification = await verifyOTP(normalizedEmail, inputCode);

    if (!verification.valid) {
      logger.warn('OTP verification failed', { 
        email: normalizedEmail, 
        reason: verification.reason 
      });

      if (verification.attemptsExceeded) {
        return res.status(429).json({ 
          message: 'Maximum verification attempts exceeded. Please request a new code.',
          code: 'MAX_ATTEMPTS_EXCEEDED'
        });
      }

      const statusCode = verification.reason.includes('expired') ? 410 : 400;
      return res.status(statusCode).json({ 
        message: verification.reason,
        attemptsRemaining: verification.attemptsRemaining 
      });
    }

    logger.info('OTP verified successfully', { email: normalizedEmail });

    res.json({
      ok: true,
      message: 'OTP verified successfully',
      email: verification.email,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/send-welcome-email
 * Body: { email, fullName }
 */
export async function sendWelcome(req, res, next) {
  try {
    const { email, fullName } = req.body || {};
    const normalizedEmail = (email || '').trim().toLowerCase();

    if (!normalizedEmail) {
      return res.status(400).json({ message: 'Email address is required' });
    }

    logger.info('Sending welcome email', { email: normalizedEmail });
    const delivery = await sendWelcomeEmail({ toEmail: normalizedEmail, fullName });

    res.json({
      ok: true,
      message: 'Welcome email sent',
      delivery,
    });
  } catch (err) {
    next(err);
  }
}
