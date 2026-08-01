/**
 * CSRF Protection Middleware using Double Submit Cookie pattern
 * Protects against Cross-Site Request Forgery attacks on state-changing operations.
 * 
 * Uses csrf-csrf library which implements modern CSRF protection without
 * relying on sessions (suitable for stateless JWT authentication).
 */
import { doubleCsrf } from 'csrf-csrf';
import cookieParser from 'cookie-parser';

const CSRF_SECRET = process.env.CSRF_SECRET || process.env.JWT_SECRET;
const isProduction = process.env.NODE_ENV === 'production';

if (!CSRF_SECRET) {
  console.warn('[CSRF] Warning: CSRF_SECRET not set. Using default (insecure for production).');
}

/**
 * Initialize CSRF protection with double submit cookie pattern
 */
const {
  generateToken, // Generates a CSRF token to send to client
  doubleCsrfProtection, // Middleware to validate CSRF token
} = doubleCsrf({
  getSecret: () => CSRF_SECRET,
  cookieName: '__Host-bmtt.csrf', // Prefix __Host- requires secure, same-site cookies
  cookieOptions: {
    httpOnly: true,
    secure: isProduction, // HTTPS only in production
    sameSite: 'strict', // Strict same-site policy
    path: '/',
    maxAge: 3600000, // 1 hour
  },
  size: 64, // Token size in bytes
  ignoredMethods: ['GET', 'HEAD', 'OPTIONS'], // Don't validate CSRF for safe methods
  getTokenFromRequest: (req) => {
    // Check multiple sources for CSRF token
    return (
      req.headers['x-csrf-token'] ||
      req.headers['csrf-token'] ||
      req.body?._csrf ||
      req.query?._csrf
    );
  },
});

/**
 * Middleware to attach CSRF token generation to response
 * Use this on routes that need to provide CSRF tokens to clients
 */
export function csrfTokenProvider(req, res, next) {
  try {
    const csrfToken = generateToken(req, res);
    // Attach token to response for client to use
    res.locals.csrfToken = csrfToken;
    next();
  } catch (err) {
    console.error('[CSRF] Token generation error:', err.message);
    next(err);
  }
}

/**
 * Main CSRF protection middleware
 * Apply to routes that perform state-changing operations (POST, PUT, DELETE, PATCH)
 */
export const csrfProtection = doubleCsrfProtection;

/**
 * Error handler for CSRF validation failures
 */
export function csrfErrorHandler(err, req, res, next) {
  if (err.code === 'EBADCSRFTOKEN' || err.message?.includes('csrf')) {
    return res.status(403).json({
      message: 'Invalid CSRF token. Please refresh the page and try again.',
      code: 'CSRF_VALIDATION_FAILED',
    });
  }
  next(err);
}

/**
 * Helper function to send CSRF token in API response
 * Use in login/authentication endpoints to provide token to authenticated clients
 */
export function sendCsrfToken(req, res) {
  const token = generateToken(req, res);
  res.json({
    csrfToken: token,
    message: 'CSRF token generated successfully',
  });
}

/**
 * Conditional CSRF protection - only enforces in production
 * Use for routes where you want CSRF protection in production but not in development
 */
export function conditionalCsrfProtection(req, res, next) {
  if (isProduction) {
    return csrfProtection(req, res, next);
  }
  next();
}

// Export cookie parser for use in app.js
export { cookieParser };

export default {
  csrfProtection,
  csrfTokenProvider,
  csrfErrorHandler,
  sendCsrfToken,
  conditionalCsrfProtection,
  generateToken,
  cookieParser,
};
