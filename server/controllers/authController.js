/**
 * Auth Controller — Login 2FA OTP generation and verification via Amazon SES.
 */
import { sendLoginOtpEmail } from '../utils/awsSes.js';

// In-memory store for login OTPs: key = normalized email, value = { code, expiresAt }
const otpStore = new Map();

/**
 * Clean up expired OTPs periodically (every 10 minutes)
 */
setInterval(() => {
  const now = Date.now();
  for (const [email, record] of otpStore.entries()) {
    if (record.expiresAt < now) {
      otpStore.delete(email);
    }
  }
}, 10 * 60 * 1000);

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

    // Generate 6-digit numeric OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes expiration

    otpStore.set(normalizedEmail, { code: otpCode, expiresAt });

    console.log(`[BookMyTable][Auth] Login OTP generated for ${normalizedEmail}: ${otpCode}`);

    // Send email via SES
    const delivery = await sendLoginOtpEmail({ toEmail: normalizedEmail, otpCode });

    res.json({
      ok: true,
      message: 'Verification code sent to email',
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

    const record = otpStore.get(normalizedEmail);
    if (!record) {
      return res.status(400).json({ message: 'No active OTP session found. Please click resend code.' });
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(normalizedEmail);
      return res.status(400).json({ message: 'Verification code has expired. Please resend a new code.' });
    }

    if (record.code !== inputCode) {
      return res.status(400).json({ message: 'Invalid verification code. Please check your email and try again.' });
    }

    // OTP verified successfully — clear record
    otpStore.delete(normalizedEmail);

    res.json({
      ok: true,
      message: 'OTP verified successfully',
    });
  } catch (err) {
    next(err);
  }
}
