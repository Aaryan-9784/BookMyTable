/**
 * Configuration Validation Utility
 * Validates all critical environment variables on application startup
 * Prevents the application from starting with misconfigured or missing credentials
 */
import { createLogger } from './logger.js';

const logger = createLogger('ConfigValidator');

/**
 * Validation result type
 */
class ValidationResult {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.infos = [];
  }

  addError(message) {
    this.errors.push(message);
  }

  addWarning(message) {
    this.warnings.push(message);
  }

  addInfo(message) {
    this.infos.push(message);
  }

  isValid() {
    return this.errors.length === 0;
  }

  log() {
    if (this.infos.length > 0) {
      logger.info('Configuration info:', { messages: this.infos });
    }

    if (this.warnings.length > 0) {
      logger.warn('Configuration warnings:', { messages: this.warnings });
    }

    if (this.errors.length > 0) {
      logger.error('Configuration errors:', { messages: this.errors });
    }
  }
}

/**
 * Validate required environment variable
 */
function validateRequired(name, value, result) {
  if (!value || value.trim() === '') {
    result.addError(`${name} is required but not set`);
    return false;
  }
  return true;
}

/**
 * Validate environment variable format
 */
function validateFormat(name, value, pattern, message, result) {
  if (value && !pattern.test(value)) {
    result.addError(`${name} ${message}`);
    return false;
  }
  return true;
}

/**
 * Validate Supabase configuration
 */
function validateSupabase(result) {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Check if Supabase is configured at all
  if (!url && !serviceKey) {
    result.addWarning('Supabase not configured - authentication will not work');
    return;
  }

  // If partially configured, that's an error
  if (!url) {
    result.addError('SUPABASE_URL is required when using Supabase authentication');
  } else {
    // Validate URL format
    validateFormat(
      'SUPABASE_URL',
      url,
      /^https:\/\/[a-z0-9-]+\.supabase\.co$/,
      'must be a valid Supabase URL (e.g., https://xxx.supabase.co)',
      result
    );

    // Check for placeholder values
    if (url.includes('your-supabase-project') || url.includes('xyzcompany')) {
      result.addError('SUPABASE_URL contains placeholder value - replace with actual Supabase project URL');
    }
  }

  if (!serviceKey) {
    result.addError('SUPABASE_SERVICE_ROLE_KEY is required when using Supabase authentication');
  } else {
    // Check for placeholder values
    if (serviceKey.includes('your-supabase') || serviceKey.includes('dummykey')) {
      result.addError('SUPABASE_SERVICE_ROLE_KEY contains placeholder value - replace with actual key');
    }

    // Validate key format (Supabase keys are typically JWT-like)
    if (serviceKey.length < 100) {
      result.addWarning('SUPABASE_SERVICE_ROLE_KEY seems too short - verify it is correct');
    }
  }

  if (url && serviceKey && !url.includes('placeholder') && !serviceKey.includes('placeholder')) {
    result.addInfo('Supabase authentication configured');
  }
}

/**
 * Validate database configuration
 */
function validateDatabase(result) {
  const mongoUri = process.env.MONGODB_URI;

  if (!validateRequired('MONGODB_URI', mongoUri, result)) {
    return;
  }

  // Validate MongoDB URI format
  if (!mongoUri.startsWith('mongodb://') && !mongoUri.startsWith('mongodb+srv://')) {
    result.addError('MONGODB_URI must start with mongodb:// or mongodb+srv://');
  }

  // Check for weak credentials in URI
  if (mongoUri.includes('username:password') || mongoUri.includes('user:pass')) {
    result.addError('MONGODB_URI contains placeholder credentials - replace with actual credentials');
  }

  // Warn about localhost in production
  if (process.env.NODE_ENV === 'production' && mongoUri.includes('localhost')) {
    result.addWarning('MONGODB_URI uses localhost in production environment');
  }

  result.addInfo('Database configuration validated');
}

/**
 * Validate JWT/security configuration
 */
function validateSecurity(result) {
  const jwtSecret = process.env.JWT_SECRET;
  const csrfSecret = process.env.CSRF_SECRET;

  if (!validateRequired('JWT_SECRET', jwtSecret, result)) {
    return;
  }

  // Check JWT secret strength
  if (jwtSecret.length < 32) {
    result.addError('JWT_SECRET must be at least 32 characters long for security');
  } else if (jwtSecret.length < 64) {
    result.addWarning('JWT_SECRET should be at least 64 characters long (recommended)');
  }

  // Check for placeholder values
  if (jwtSecret.includes('your-') || jwtSecret.includes('change-this') || jwtSecret === 'secret') {
    result.addError('JWT_SECRET contains placeholder or weak value - generate a secure random string');
  }

  // CSRF secret validation (optional, can use JWT_SECRET)
  if (!csrfSecret) {
    result.addInfo('CSRF_SECRET not set - will use JWT_SECRET as fallback');
  } else if (csrfSecret.length < 32) {
    result.addWarning('CSRF_SECRET should be at least 32 characters long');
  }

  result.addInfo('Security configuration validated');
}

/**
 * Validate email service configuration
 */
function validateEmail(result) {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPassword = process.env.GMAIL_APP_PASSWORD;
  const resendKey = process.env.RESEND_API_KEY;

  // At least one email service should be configured
  if (!gmailPassword && !resendKey) {
    result.addWarning('No email service configured - email notifications will not work');
    return;
  }

  // Gmail validation
  if (gmailUser || gmailPassword) {
    if (!gmailUser) {
      result.addWarning('GMAIL_USER not set but GMAIL_APP_PASSWORD is configured');
    }
    if (!gmailPassword) {
      result.addWarning('GMAIL_APP_PASSWORD not set but GMAIL_USER is configured');
    }
    
    if (gmailUser && !gmailUser.includes('@gmail.com')) {
      result.addWarning('GMAIL_USER should be a Gmail address');
    }

    if (gmailPassword && gmailPassword.length < 16) {
      result.addWarning('GMAIL_APP_PASSWORD seems too short - should be 16 characters from Google');
    }

    if (gmailUser && gmailPassword) {
      result.addInfo('Gmail SMTP service configured');
    }
  }

  // Resend validation
  if (resendKey) {
    if (!resendKey.startsWith('re_')) {
      result.addWarning('RESEND_API_KEY should start with "re_" - verify it is correct');
    }
    result.addInfo('Resend email service configured');
  }
}

/**
 * Validate Cloudinary configuration (for image uploads)
 */
function validateCloudinary(result) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName && !apiKey && !apiSecret) {
    result.addWarning('Cloudinary not configured - image uploads will not work');
    return;
  }

  if (!cloudName) {
    result.addError('CLOUDINARY_CLOUD_NAME is required for image uploads');
  }
  if (!apiKey) {
    result.addError('CLOUDINARY_API_KEY is required for image uploads');
  }
  if (!apiSecret) {
    result.addError('CLOUDINARY_API_SECRET is required for image uploads');
  }

  if (cloudName && apiKey && apiSecret) {
    result.addInfo('Cloudinary image storage configured');
  }
}

/**
 * Validate production-specific requirements
 */
function validateProduction(result) {
  if (process.env.NODE_ENV !== 'production') {
    return;
  }

  // Production-specific checks
  if (process.env.DEV_AUTH_ENABLED === 'true') {
    result.addError('DEV_AUTH_ENABLED must be disabled in production');
  }

  if (process.env.DEV_OTP_BYPASS === 'true') {
    result.addError('DEV_OTP_BYPASS must be disabled in production');
  }

  const clientUrl = process.env.CLIENT_URL;
  if (clientUrl && clientUrl.includes('localhost')) {
    result.addWarning('CLIENT_URL uses localhost in production');
  }

  // Ensure admin emails are set
  if (!process.env.ADMIN_EMAILS) {
    result.addWarning('ADMIN_EMAILS not set - no admin access will be available');
  }

  result.addInfo('Production environment configuration validated');
}

/**
 * Validate all configuration
 */
export function validateConfiguration() {
  const result = new ValidationResult();

  logger.info('Starting configuration validation...');

  try {
    validateDatabase(result);
    validateSupabase(result);
    validateSecurity(result);
    validateEmail(result);
    validateCloudinary(result);
    validateProduction(result);

    result.log();

    if (!result.isValid()) {
      logger.error('Configuration validation failed - application cannot start safely');
      return { valid: false, errors: result.errors };
    }

    if (result.warnings.length > 0) {
      logger.warn(`Configuration validation passed with ${result.warnings.length} warning(s)`);
    } else {
      logger.info('Configuration validation passed - all critical settings configured');
    }

    return { valid: true, warnings: result.warnings };
  } catch (error) {
    logger.error('Configuration validation error', { error: error.message });
    return { valid: false, errors: ['Configuration validation failed: ' + error.message] };
  }
}

/**
 * Print configuration summary (without sensitive values)
 */
export function printConfigSummary() {
  logger.info('Configuration Summary:', {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: process.env.PORT || '5000',
    databaseConfigured: Boolean(process.env.MONGODB_URI),
    supabaseConfigured: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY),
    emailConfigured: Boolean(process.env.GMAIL_APP_PASSWORD || process.env.RESEND_API_KEY),
    cloudinaryConfigured: Boolean(process.env.CLOUDINARY_CLOUD_NAME),
    devAuthEnabled: process.env.DEV_AUTH_ENABLED === 'true',
    passwordBreachCheck: process.env.CHECK_PASSWORD_BREACH === 'true',
    rateLimiting: Boolean(process.env.RATE_LIMIT_MAX_REQUESTS),
    csrfProtection: Boolean(process.env.CSRF_SECRET || process.env.JWT_SECRET),
  });
}

export default {
  validateConfiguration,
  printConfigSummary,
};
