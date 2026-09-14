/**
 * Auth Controller — Pure MongoDB Authentication & OTP verification.
 */
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendLoginOtpEmail, sendWelcomeEmail } from '../utils/emailService.js';
import { createLogger } from '../utils/logger.js';
import { generateOTP, storeOTP, verifyOTP } from '../services/otpService.js';

const logger = createLogger('Auth');

/**
 * Determine user role based on email & environment variables
 */
function determineRole(email) {
  const emailLower = (email || '').toLowerCase().trim();
  const adminEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (adminEmails.includes(emailLower)) {
    return 'admin';
  }

  // All new accounts get customer role by default
  return 'customer';
}

/**
 * Generate a signed JWT token for the user
 */
function generateToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured on the server');
  }

  return jwt.sign(
    {
      sub: String(user._id),
      id: String(user._id),
      email: user.email,
      name: user.name,
      role: user.role,
      restaurantId: user.restaurantId || null,
      user_metadata: {
        full_name: user.name,
      },
    },
    secret,
    { expiresIn: '7d' }
  );
}

/**
 * POST /api/auth/register (or /api/auth/signup)
 * Register a new user in MongoDB
 */
export async function register(req, res, next) {
  try {
    const { email, password, fullName, phone } = req.body || {};

    if (!email || !password || !fullName) {
      return res.status(400).json({ message: 'Email, password, and full name are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    const assignedRole = determineRole(normalizedEmail);

    const user = new User({
      email: normalizedEmail,
      name: fullName.trim(),
      password,
      phone: phone ? phone.trim() : '',
      role: assignedRole,
    });

    await user.save();
    logger.info('User registered successfully in MongoDB', { email: normalizedEmail, role: assignedRole });

    const token = generateToken(user);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
      },
      message: 'Registration successful',
    });
  } catch (err) {
    logger.error('Registration failed', { error: err.message });
    next(err);
  }
}

/**
 * POST /api/auth/login
 * Log in a user using MongoDB credentials
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find user with password included
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Ensure accounts listed in ADMIN_EMAILS have the admin role
    const adminEmails = (process.env.ADMIN_EMAILS || '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    if (adminEmails.includes(normalizedEmail) && user.role !== 'admin') {
      user.role = 'admin';
      await user.save();
    }

    const token = generateToken(user);
    logger.info('User logged in successfully via MongoDB', { email: normalizedEmail, role: user.role });

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
      },
      message: 'Login successful',
    });
  } catch (err) {
    logger.error('Login failed', { error: err.message });
    next(err);
  }
}

/**
 * POST /api/auth/reset-password
 * Reset user password in MongoDB
 */
export async function resetPassword(req, res, next) {
  try {
    const { email, newPassword } = req.body || {};

    if (!email || !newPassword) {
      return res.status(400).json({ message: 'Email and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ message: 'No account found with this email' });
    }

    user.password = newPassword;
    await user.save(); // Triggers Mongoose bcrypt pre-save hash hook

    logger.info('User password reset successfully in MongoDB', { email: normalizedEmail });

    res.json({
      ok: true,
      message: 'Password updated successfully',
    });
  } catch (err) {
    logger.error('Password reset failed', { error: err.message });
    next(err);
  }
}

/**
 * POST /api/auth/send-login-otp
 * Body: { email }
 */
export async function sendLoginOtp(req, res, next) {
  try {
    const { email, password } = req.body || {};
    const normalizedEmail = (email || '').trim().toLowerCase();

    if (!normalizedEmail) {
      return res.status(400).json({ message: 'Email address is required' });
    }

    // If password was provided (login flow), verify credentials before generating OTP
    if (password) {
      const existingUser = await User.findOne({ email: normalizedEmail }).select('+password');
      if (!existingUser) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      if (existingUser.password) {
        const isMatch = await existingUser.comparePassword(password);
        if (!isMatch) {
          return res.status(401).json({ message: 'Invalid email or password' });
        }
      }
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

    if (process.env.NODE_ENV !== 'production') {
      logger.info(`[DEV MODE] OTP Code for ${normalizedEmail}: ${otpCode} (Bypass Code: 123456)`);
    }

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
    const { email, code, password } = req.body || {};
    const normalizedEmail = (email || '').trim().toLowerCase();
    const inputCode = (code || '').trim();

    if (!normalizedEmail || !inputCode) {
      return res.status(400).json({ message: 'Email and verification code are required' });
    }

    // Development bypass: enabled in non-production mode or if explicitly configured
    const isDevelopment = process.env.NODE_ENV !== 'production';
    const bypassEnabled = process.env.DEV_OTP_BYPASS !== 'false';
    const bypassCode = process.env.DEV_OTP_BYPASS_CODE || '123456';
    const isDevBypass = isDevelopment && bypassEnabled && inputCode === bypassCode;

    if (!isDevBypass) {
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

        return res.status(400).json({ 
          message: verification.reason || 'Invalid or expired verification code',
          attemptsRemaining: verification.attemptsRemaining 
        });
      }
    } else {
      logger.warn('OTP verification bypassed (development mode)', { email: normalizedEmail });
    }

    // Once OTP is confirmed, fetch or create user in MongoDB
    let user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      const assignedRole = determineRole(normalizedEmail);
      user = new User({
        email: normalizedEmail,
        name: normalizedEmail.split('@')[0],
        role: assignedRole,
        password: password || '',
      });
      await user.save();
    } else {
      // If user has a password and a password was provided, verify it
      if (password && user.password) {
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
          return res.status(401).json({ message: 'Invalid email or password' });
        }
      } else if (password && !user.password && password.length >= 6) {
        // Set password only if user doesn't have one configured yet
        user.password = password;
      }

      // Ensure admin email has admin role
      const adminEmails = (process.env.ADMIN_EMAILS || '')
        .split(',')
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);

      if (adminEmails.includes(normalizedEmail) && user.role !== 'admin') {
        user.role = 'admin';
      }
      await user.save();
    }

    const token = generateToken(user);
    logger.info('User verified and authenticated via OTP successfully', { email: normalizedEmail, role: user.role });

    res.json({
      ok: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
      },
      message: 'Login successful',
      email: normalizedEmail,
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
