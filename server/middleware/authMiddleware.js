/**
 * Express middleware: reads Authorization Bearer token, verifies JWT with server secret,
 * fetches User from MongoDB, and attaches req.user and req.jwtPayload.
 */
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('Auth');

/**
 * Verify JWT token and extract payload
 */
function verifyToken(token) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured on the server');
  }

  return jwt.verify(token, secret, { algorithms: ['HS256'] });
}

/**
 * Determine user role based on email and environment variables
 */
function determineUserRole(email, existingRole = null) {
  const emailLower = (email || '').toLowerCase().trim();

  // Admin role assignment from ADMIN_EMAILS
  const adminEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (adminEmails.includes(emailLower)) {
    return 'admin';
  }

  // Preserve existing role assigned in database (e.g., promoted to restaurant by Admin)
  if (existingRole && ['restaurant', 'admin', 'customer'].includes(existingRole.toLowerCase())) {
    return existingRole.toLowerCase();
  }

  // All new users default to customer
  return 'customer';
}

/**
 * Extract user identity fields from token payload
 */
function extractUserInfo(payload) {
  const userId =
    payload.id ||
    payload._id ||
    payload.userId ||
    payload.sub ||
    null;

  const email =
    payload.email ||
    payload['cognito:username'] ||
    null;

  const name =
    payload.name ||
    payload.given_name ||
    (email ? email.split('@')[0] : 'User');

  return {
    userId,
    email: email ? email.toLowerCase().trim() : null,
    name: typeof name === 'string' ? name.trim() : 'User',
  };
}

/**
 * Main authentication middleware
 */
export async function authMiddleware(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Missing or invalid Authorization header',
      code: 'NO_AUTH_HEADER',
    });
  }

  const token = header.slice('Bearer '.length).trim();

  if (!token) {
    return res.status(401).json({
      message: 'Token required',
      code: 'NO_TOKEN',
    });
  }

  try {
    // Verify token using JWT_SECRET
    const payload = verifyToken(token);

    // Extract identity
    const { userId, email, name } = extractUserInfo(payload);

    // Find user in MongoDB by ID or email
    let user = null;
    if (userId) {
      try {
        user = await User.findById(userId);
      } catch (err) {
        // userId might not be a valid Mongo ObjectId, will search by email below
      }
    }

    if (!user && email) {
      user = await User.findOne({ email });
    }

    if (!user) {
      // Create user record if not existing yet
      const determinedRole = determineUserRole(email);
      user = await User.create({
        email: email || `user_${userId}@local.host`,
        name,
        role: determinedRole,
      });
      logger.info('New user record created in MongoDB from auth token', { email: user.email, role: determinedRole });
    } else {
      // Ensure super-admins in ADMIN_EMAILS have the admin role
      const adminEmails = (process.env.ADMIN_EMAILS || '')
        .split(',')
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);

      if (adminEmails.includes((user.email || '').toLowerCase()) && user.role !== 'admin') {
        user.role = 'admin';
        await user.save();
      }
    }

    // Attach to request
    req.user = user;
    req.jwtPayload = payload;

    next();
  } catch (err) {
    logger.error('Authentication failed', { error: err.message });
    return res.status(401).json({
      message: 'Invalid or expired token',
      code: 'AUTH_FAILED',
      detail: process.env.NODE_ENV === 'production' ? undefined : err.message,
    });
  }
}

// Backward-compatible aliases
export const verifyAuthToken = authMiddleware;
export const verifyCognitoToken = authMiddleware;
export default authMiddleware;
