/**
 * Development Authentication Controller
 * ONLY for local development when Supabase is not configured
 * 
 * ⚠️ WARNING: This file should NEVER be used in production!
 * The routes using these controllers must be disabled in production via middleware.
 */
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('DevAuth');

/**
 * POST /api/dev-auth/login
 * Development-only login that generates server-signed JWT
 * 
 * ⚠️ Only works when NODE_ENV !== 'production' and DEV_AUTH_ENABLED=true
 */
export async function devLogin(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find or create development user
    let user = await User.findOne({ email: normalizedEmail }).select('+password');
    
    if (!user) {
      // Auto-create dev user
      user = new User({
        email: normalizedEmail,
        name: req.body.fullName || normalizedEmail.split('@')[0],
        password: password,
        role: 'customer',
      });
      await user.save();
      logger.info('Development user created', { email: normalizedEmail });
    } else if (user.password) {
      // Verify password if user exists
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
    }

    // Generate server-signed JWT token
    const token = jwt.sign(
      {
        sub: String(user._id),
        email: user.email,
        name: user.name,
        role: user.role,
        user_metadata: {
          full_name: user.name,
        },
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
      },
      process.env.JWT_SECRET,
      { algorithm: 'HS256' }
    );

    logger.info('Development login successful', { email: normalizedEmail, userId: String(user._id) });

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      devMode: true,
      warning: 'Development mode - not suitable for production',
    });
  } catch (err) {
    logger.error('Development login failed', { error: err.message });
    next(err);
  }
}

/**
 * POST /api/dev-auth/signup
 * Development-only signup
 */
export async function devSignup(req, res, next) {
  try {
    const { email, password, fullName } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ message: 'Email, password, and full name are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // Create new user
    const user = new User({
      email: normalizedEmail,
      name: fullName.trim(),
      password: password,
      role: 'customer',
    });
    await user.save();

    logger.info('Development user registered', { email: normalizedEmail });

    // Generate token
    const token = jwt.sign(
      {
        sub: String(user._id),
        email: user.email,
        name: user.name,
        role: user.role,
        user_metadata: {
          full_name: user.name,
        },
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60),
      },
      process.env.JWT_SECRET,
      { algorithm: 'HS256' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      devMode: true,
      userConfirmed: true, // Auto-confirm in dev mode
    });
  } catch (err) {
    logger.error('Development signup failed', { error: err.message });
    next(err);
  }
}

export default {
  devLogin,
  devSignup,
};
