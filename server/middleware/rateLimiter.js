/**
 * Rate Limiting Middleware — Protect against brute force, DDoS, and API abuse.
 * Uses express-rate-limit with configurable windows and max requests.
 */
import rateLimit from 'express-rate-limit';

/**
 * General API rate limiter
 * Default: 100 requests per 15 minutes per IP
 */
export const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  message: {
    message: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes',
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  // Skip rate limiting in test environment
  skip: (req) => process.env.NODE_ENV === 'test',
});

/**
 * Strict rate limiter for authentication endpoints
 * Default: 5 requests per 15 minutes per IP
 * Prevents brute force attacks on login/OTP
 */
export const authLimiter = rateLimit({
  windowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS, 10) || 5,
  message: {
    message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.',
    retryAfter: '15 minutes',
    hint: 'This protection prevents brute force attacks. If you need assistance, contact support.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'test',
  skipSuccessfulRequests: true, // Don't count successful auth attempts
});

/**
 * Moderate rate limiter for OTP/verification endpoints
 * Default: 3 OTP requests per 15 minutes per IP
 * Prevents OTP spam and abuse
 */
export const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3,
  message: {
    message: 'Too many verification code requests. Please wait 15 minutes before requesting another code.',
    retryAfter: '15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'test',
});

/**
 * Booking rate limiter
 * Default: 10 bookings per hour per IP
 * Prevents spam bookings
 */
export const bookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: {
    message: 'Too many booking attempts. Please try again later.',
    retryAfter: '1 hour',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'test',
});

/**
 * File upload rate limiter
 * Default: 20 uploads per hour per IP
 * Prevents upload abuse
 */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  message: {
    message: 'Too many file uploads. Please try again later.',
    retryAfter: '1 hour',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'test',
});

/**
 * Admin action rate limiter
 * Default: 100 requests per 15 minutes per user
 * Protects admin endpoints from abuse
 */
export const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    message: 'Too many admin actions. Please try again later.',
    retryAfter: '15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'test',
});

/**
 * Creates a custom rate limiter with specified options
 * @param {Object} options - Rate limit options
 * @returns {Function} Rate limit middleware
 */
export function createRateLimiter(options) {
  return rateLimit({
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => process.env.NODE_ENV === 'test',
    ...options,
  });
}

export default {
  generalLimiter,
  authLimiter,
  otpLimiter,
  bookingLimiter,
  uploadLimiter,
  adminLimiter,
  createRateLimiter,
};
