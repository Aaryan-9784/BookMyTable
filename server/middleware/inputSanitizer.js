/**
 * Input Sanitization Middleware for XSS Prevention
 * 
 * This middleware sanitizes user input to prevent XSS attacks by:
 * 1. Escaping HTML entities in text fields
 * 2. Removing dangerous scripts and attributes
 * 3. Normalizing and validating input formats
 * 4. Applying field-specific sanitization rules
 */

import validator from 'validator';
import { filterXSS } from 'xss';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('InputSanitizer');

/**
 * XSS filter options - restrictive but allows safe HTML tags
 */
const xssOptions = {
  whiteList: {
    // Allow safe text formatting only
    p: [],
    br: [],
    strong: [],
    b: [],
    em: [],
    i: [],
    u: [],
  },
  stripIgnoreTag: true,
  stripIgnoreTagBody: ['script', 'style'],
};

/**
 * Sanitize string input - removes XSS threats
 */
function sanitizeString(value, options = {}) {
  if (typeof value !== 'string') {
    return value;
  }

  let sanitized = value;

  // Trim whitespace
  if (options.trim !== false) {
    sanitized = sanitized.trim();
  }

  // Apply XSS filtering
  if (options.allowHTML) {
    // Allow limited HTML tags
    sanitized = filterXSS(sanitized, xssOptions);
  } else {
    // Escape all HTML entities (default)
    sanitized = validator.escape(sanitized);
  }

  // Apply length limits
  if (options.maxLength && sanitized.length > options.maxLength) {
    sanitized = sanitized.substring(0, options.maxLength);
    logger.warn('Input truncated due to length limit', {
      maxLength: options.maxLength,
      originalLength: value.length,
    });
  }

  return sanitized;
}

/**
 * Sanitize email addresses
 */
function sanitizeEmail(value) {
  if (typeof value !== 'string') {
    return value;
  }

  const normalized = validator.normalizeEmail(value, {
    gmail_remove_dots: false,
    gmail_remove_subaddress: false,
    outlookdotcom_remove_subaddress: false,
    yahoo_remove_subaddress: false,
  });

  return normalized || value.trim().toLowerCase();
}

/**
 * Sanitize URL
 */
function sanitizeURL(value) {
  if (typeof value !== 'string') {
    return value;
  }

  let trimmed = value.trim()
    .replace(/&#x2F;/g, '/')
    .replace(/&amp;/g, '&')
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"');

  // Allow standard http/https/data/blob/relative URLs
  if (
    validator.isURL(trimmed, { protocols: ['http', 'https'], require_protocol: true }) ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('/')
  ) {
    return trimmed;
  }

  return trimmed;
}

/**
 * Sanitize phone number
 */
function sanitizePhone(value) {
  if (typeof value !== 'string') {
    return value;
  }

  // Remove all non-numeric characters except + at start
  let sanitized = value.trim();
  if (sanitized.startsWith('+')) {
    sanitized = '+' + sanitized.slice(1).replace(/\D/g, '');
  } else {
    sanitized = sanitized.replace(/\D/g, '');
  }

  return sanitized;
}

/**
 * Sanitize object recursively
 */
function sanitizeObject(obj, fieldRules = {}) {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item, fieldRules));
  }

  const sanitized = {};

  for (const [key, value] of Object.entries(obj)) {
    // Skip null/undefined
    if (value === null || value === undefined) {
      sanitized[key] = value;
      continue;
    }

    // Get field-specific rules
    const rules = fieldRules[key] || {};

    const isUrlField = rules.type === 'url' || /url/i.test(key) || key === 'imageUrl' || key === 'imageUrls';

    // Handle different types
    if (typeof value === 'string') {
      // Apply field-specific sanitization
      if (rules.type === 'email') {
        sanitized[key] = sanitizeEmail(value);
      } else if (isUrlField) {
        sanitized[key] = sanitizeURL(value);
      } else if (rules.type === 'phone') {
        sanitized[key] = sanitizePhone(value);
      } else {
        sanitized[key] = sanitizeString(value, rules);
      }
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeObject(value, rules.nested || {});
    } else {
      // Numbers, booleans, etc. - pass through
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Field sanitization rules by endpoint/model
 */
const sanitizationRules = {
  // Restaurant data
  restaurant: {
    name: { maxLength: 200 },
    description: { maxLength: 2000, allowHTML: true },
    address: { maxLength: 500 },
    imageUrl: { type: 'url' },
    imageUrls: { type: 'url' },
    phone: { type: 'phone' },
    email: { type: 'email' },
    website: { type: 'url' },
    cuisine: { maxLength: 100 },
    priceRange: { maxLength: 50 },
    openingHours: { maxLength: 500 },
    amenities: { maxLength: 1000 },
  },

  // User data
  user: {
    name: { maxLength: 200 },
    email: { type: 'email' },
    phone: { type: 'phone' },
    bio: { maxLength: 1000, allowHTML: false },
    address: { maxLength: 500 },
  },

  // Booking data
  booking: {
    specialRequests: { maxLength: 500, allowHTML: false },
    customerName: { maxLength: 200 },
    customerEmail: { type: 'email' },
    customerPhone: { type: 'phone' },
    notes: { maxLength: 1000, allowHTML: false },
  },

  // Review data
  review: {
    title: { maxLength: 200 },
    content: { maxLength: 2000, allowHTML: false },
    restaurantName: { maxLength: 200 },
  },
};

/**
 * Middleware factory - creates sanitization middleware for specific data types
 */
export function createSanitizationMiddleware(dataType) {
  return (req, res, next) => {
    try {
      const rules = sanitizationRules[dataType] || {};

      // Sanitize request body
      if (req.body && typeof req.body === 'object') {
        req.body = sanitizeObject(req.body, rules);
      }

      // Sanitize query parameters
      if (req.query && typeof req.query === 'object') {
        req.query = sanitizeObject(req.query, rules);
      }

      // Sanitize URL parameters
      if (req.params && typeof req.params === 'object') {
        req.params = sanitizeObject(req.params, {});
      }

      next();
    } catch (error) {
      logger.error('Input sanitization failed', { error: error.message });
      return res.status(400).json({
        message: 'Invalid input data',
        code: 'SANITIZATION_ERROR',
      });
    }
  };
}

/**
 * General sanitization middleware - applies basic sanitization
 */
export function generalSanitization(req, res, next) {
  try {
    // Sanitize request body
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeObject(req.body, {});
    }

    // Sanitize query parameters
    if (req.query && typeof req.query === 'object') {
      req.query = sanitizeObject(req.query, {});
    }

    // Sanitize URL parameters
    if (req.params && typeof req.params === 'object') {
      req.params = sanitizeObject(req.params, {});
    }

    next();
  } catch (error) {
    logger.error('General sanitization failed', { error: error.message });
    return res.status(400).json({
      message: 'Invalid input data',
      code: 'SANITIZATION_ERROR',
    });
  }
}

/**
 * Utility functions exported for use in controllers/services
 */
export const sanitize = {
  string: sanitizeString,
  email: sanitizeEmail,
  url: sanitizeURL,
  phone: sanitizePhone,
  object: sanitizeObject,
};

export default {
  createSanitizationMiddleware,
  generalSanitization,
  sanitize,
};
