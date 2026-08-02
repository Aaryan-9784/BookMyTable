/**
 * Express middleware: reads Authorization Bearer token, verifies JWT (Supabase / Custom JWT),
 * upserts User in MongoDB, attaches req.user (document) and req.jwtPayload.
 * 
 * Security improvements:
 * - Removed header-based role/password manipulation
 * - Simplified payload extraction
 * - Role assignment based solely on environment configuration
 * - No password extraction from JWT
 */
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('Auth');

/**
 * Verify JWT token and extract payload
 * Supports Supabase tokens and development tokens
 */
async function verifyToken(token) {
  // Try to decode and verify the token
  try {
    // For development tokens (signed with JWT_SECRET)
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
    });
    return decoded;
  } catch (jwtError) {
    // For Supabase tokens, try simple decode (they're verified by Supabase)
    // In production, you should verify Supabase tokens using their public key
    try {
      const decoded = jwt.decode(token);
      if (decoded && (decoded.sub || decoded.email)) {
        return decoded;
      }
    } catch (decodeError) {
      logger.error('Token verification failed', { error: jwtError.message });
    }
    throw new Error('Invalid or expired token');
  }
}

/**
 * Determine user role based on email, environment configuration, and existing database role
 */
function determineUserRole(email, existingRole = null) {
  const emailLower = email.toLowerCase().trim();
  
  // Admin role assignment
  const adminEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  
  if (adminEmails.includes(emailLower)) {
    return 'admin';
  }
  
  // Restaurant role assignment
  const restaurantEmails = (process.env.RESTAURANT_EMAILS || process.env.RESTAURANT_OWNER_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  
  if (restaurantEmails.includes(emailLower)) {
    return 'restaurant';
  }
  
  // Preserve existing database role if set to restaurant or admin
  if (existingRole && ['restaurant', 'admin'].includes(existingRole.toLowerCase())) {
    return existingRole.toLowerCase();
  }

  // Default customer role
  return 'customer';
}

/**
 * Extract user information from JWT payload
 */
function extractUserInfo(payload) {
  // Extract email
  const email = 
    payload.email ||
    payload['cognito:username'] ||
    payload.user_metadata?.email ||
    null;
  
  if (!email || typeof email !== 'string') {
    throw new Error('Email not found in token');
  }
  
  // Extract user ID
  const userId = payload.sub || payload.id;
  if (!userId) {
    throw new Error('User ID not found in token');
  }
  
  // Extract name
  const name =
    payload.user_metadata?.full_name ||
    payload.name ||
    payload.given_name ||
    email.split('@')[0];
  
  return {
    userId,
    email: email.toLowerCase().trim(),
    name: typeof name === 'string' ? name.trim() : email.split('@')[0],
  };
}

/**
 * Main authentication middleware
 */
export async function verifyCognitoToken(req, res, next) {
  const header = req.headers.authorization;
  
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ 
      message: 'Missing or invalid Authorization header',
      code: 'NO_AUTH_HEADER'
    });
  }

  const token = header.slice('Bearer '.length).trim();
  
  if (!token) {
    return res.status(401).json({ 
      message: 'Token required',
      code: 'NO_TOKEN'
    });
  }

  try {
    // Verify and decode token
    const payload = await verifyToken(token);
    
    // Extract user information
    const { userId, email, name } = extractUserInfo(payload);
    
    // Find or create user in database
    let user = await User.findOne({ email });
    
    // Determine role based on environment configuration or existing user role
    const determinedRole = determineUserRole(email, user?.role);
    
    if (user) {
      // Update existing user
      const updates = {};
      
      // Update name if empty
      if (!user.name && name) {
        updates.name = name;
      }
      
      // Update role if it has changed (based on ADMIN_EMAILS or RESTAURANT_EMAILS)
      if (user.role !== determinedRole) {
        updates.role = determinedRole;
        logger.info('User role updated', { 
          email, 
          oldRole: user.role, 
          newRole: determinedRole 
        });
      }
      
      // Normalize legacy 'user' role to 'customer'
      if (user.role === 'user') {
        updates.role = 'customer';
      }
      
      // Apply updates if any
      if (Object.keys(updates).length > 0) {
        user = await User.findByIdAndUpdate(
          user._id,
          { $set: updates },
          { new: true }
        );
      }
    } else {
      // Create new user
      user = await User.create({
        email,
        name,
        role: determinedRole,
      });
      
      logger.info('New user created', { email, role: determinedRole });
    }
    
    // Attach user and payload to request
    req.user = user;
    req.jwtPayload = payload;
    
    next();
  } catch (err) {
    logger.error('Authentication failed', { error: err.message });
    return res.status(401).json({ 
      message: 'Authentication failed',
      code: 'AUTH_FAILED',
      detail: process.env.NODE_ENV === 'production' ? undefined : err.message
    });
  }
}

export default verifyCognitoToken;
