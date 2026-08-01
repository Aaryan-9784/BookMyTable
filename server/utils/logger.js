/**
 * Secure Logging Utility — Sanitizes sensitive data before logging.
 * Prevents accidental exposure of credentials, tokens, and PII in logs.
 */

const isProduction = process.env.NODE_ENV === 'production';
const logLevel = process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug');

const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

/**
 * Sensitive fields that should be redacted from logs
 */
const SENSITIVE_FIELDS = new Set([
  'password',
  'newPassword',
  'currentPassword',
  'oldPassword',
  'token',
  'accessToken',
  'refreshToken',
  'idToken',
  'secret',
  'apiKey',
  'api_key',
  'authorization',
  'cookie',
  'csrf',
  'csrfToken',
  'otp',
  'otpCode',
  'code',
  'pin',
  'ssn',
  'creditCard',
  'cardNumber',
  'cvv',
  'privateKey',
]);

/**
 * Patterns to detect and redact from strings
 */
const SENSITIVE_PATTERNS = [
  // Email OTP codes (6 digits)
  { pattern: /\b\d{6}\b/g, replacement: '******' },
  // JWT tokens
  { pattern: /eyJ[A-Za-z0-9-_=]+\.eyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_.+/=]*/g, replacement: '[JWT_REDACTED]' },
  // API keys (common patterns)
  { pattern: /[a-zA-Z0-9_-]{32,}/g, replacement: '[KEY_REDACTED]' },
  // Email addresses in sensitive contexts
  { pattern: /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})(?=.*(?:password|token|otp|code))/gi, replacement: '[EMAIL_REDACTED]' },
];

/**
 * Sanitize an object by redacting sensitive fields
 * @param {any} obj - Object to sanitize
 * @param {number} depth - Current recursion depth
 * @returns {any} Sanitized object
 */
function sanitizeObject(obj, depth = 0) {
  if (depth > 5) return '[MAX_DEPTH]'; // Prevent deep recursion
  
  if (obj === null || obj === undefined) return obj;
  
  // Handle primitive types
  if (typeof obj !== 'object') {
    return typeof obj === 'string' ? sanitizeString(obj) : obj;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, depth + 1));
  }

  // Handle objects
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    const keyLower = key.toLowerCase();
    
    // Redact sensitive fields
    if (SENSITIVE_FIELDS.has(keyLower)) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeObject(value, depth + 1);
    } else if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

/**
 * Sanitize a string by removing sensitive patterns
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
function sanitizeString(str) {
  if (!str || typeof str !== 'string') return str;
  
  let sanitized = str;
  for (const { pattern, replacement } of SENSITIVE_PATTERNS) {
    sanitized = sanitized.replace(pattern, replacement);
  }
  
  return sanitized;
}

/**
 * Format log message with timestamp and level
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {any} meta - Additional metadata
 * @returns {string} Formatted log message
 */
function formatLogMessage(level, message, meta) {
  const timestamp = new Date().toISOString();
  const sanitizedMeta = meta ? sanitizeObject(meta) : null;
  
  if (process.env.LOG_FORMAT === 'json') {
    return JSON.stringify({
      timestamp,
      level,
      message: sanitizeString(message),
      ...(sanitizedMeta && { meta: sanitizedMeta }),
    });
  }
  
  const metaStr = sanitizedMeta ? ` ${JSON.stringify(sanitizedMeta)}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${sanitizeString(message)}${metaStr}`;
}

/**
 * Check if a log level should be logged
 * @param {string} level - Log level to check
 * @returns {boolean} Whether to log
 */
function shouldLog(level) {
  const currentLevel = LOG_LEVELS[logLevel] || LOG_LEVELS.info;
  const messageLevel = LOG_LEVELS[level] || LOG_LEVELS.info;
  return messageLevel <= currentLevel;
}

/**
 * Logger class with sanitization
 */
class Logger {
  constructor(context = '') {
    this.context = context;
  }

  /**
   * Log error message
   */
  error(message, meta) {
    if (shouldLog('error')) {
      const contextMsg = this.context ? `[${this.context}] ${message}` : message;
      console.error(formatLogMessage('error', contextMsg, meta));
    }
  }

  /**
   * Log warning message
   */
  warn(message, meta) {
    if (shouldLog('warn')) {
      const contextMsg = this.context ? `[${this.context}] ${message}` : message;
      console.warn(formatLogMessage('warn', contextMsg, meta));
    }
  }

  /**
   * Log info message
   */
  info(message, meta) {
    if (shouldLog('info')) {
      const contextMsg = this.context ? `[${this.context}] ${message}` : message;
      console.log(formatLogMessage('info', contextMsg, meta));
    }
  }

  /**
   * Log debug message (only in development)
   */
  debug(message, meta) {
    if (shouldLog('debug')) {
      const contextMsg = this.context ? `[${this.context}] ${message}` : message;
      console.log(formatLogMessage('debug', contextMsg, meta));
    }
  }

  /**
   * Create a child logger with additional context
   */
  child(additionalContext) {
    const newContext = this.context 
      ? `${this.context}:${additionalContext}` 
      : additionalContext;
    return new Logger(newContext);
  }
}

/**
 * Create a logger instance
 * @param {string} context - Context/module name
 * @returns {Logger} Logger instance
 */
export function createLogger(context) {
  return new Logger(context);
}

/**
 * Default logger instance
 */
export const logger = new Logger('BookMyTable');

/**
 * Express middleware to log HTTP requests (sanitized)
 */
export function httpLogger(req, res, next) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const sanitizedBody = sanitizeObject(req.body);
    
    logger.info(`HTTP ${req.method} ${req.path}`, {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      // Only log body for non-GET requests in debug mode
      ...(req.method !== 'GET' && logLevel === 'debug' && { body: sanitizedBody }),
    });
  });
  
  next();
}

export default {
  createLogger,
  logger,
  httpLogger,
  sanitizeObject,
  sanitizeString,
};
