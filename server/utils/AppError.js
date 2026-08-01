/**
 * Custom Application Error Class
 * 
 * Provides standardized error handling with error codes,
 * HTTP status codes, and additional context.
 * 
 * Usage:
 * throw new AppError('Resource not found', 404, 'RESOURCE_NOT_FOUND');
 */

class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) {
    super(message);
    
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true; // Distinguishes operational errors from programming errors
    this.timestamp = new Date().toISOString();
    
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      ...(this.details && { details: this.details }),
      ...(process.env.NODE_ENV === 'development' && { stack: this.stack }),
    };
  }
}

/**
 * Pre-defined error types for common scenarios
 */

export class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, 400, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 403, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, 409, 'CONFLICT');
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too many requests') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
    this.name = 'RateLimitError';
  }
}

export class DatabaseError extends AppError {
  constructor(message = 'Database operation failed', details = null) {
    super(message, 500, 'DATABASE_ERROR', details);
    this.name = 'DatabaseError';
  }
}

export class ExternalServiceError extends AppError {
  constructor(service = 'External service', details = null) {
    super(`${service} is unavailable`, 503, 'SERVICE_UNAVAILABLE', details);
    this.name = 'ExternalServiceError';
  }
}

export default AppError;
