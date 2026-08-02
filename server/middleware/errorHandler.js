/**
 * Centralized Error Handling Middleware
 * 
 * Catches all errors in the application and returns consistent error responses.
 * Logs errors appropriately based on severity.
 * Handles operational errors vs programming errors differently.
 */

import { createLogger } from '../utils/logger.js';
import AppError from '../utils/AppError.js';

const logger = createLogger('ErrorHandler');

/**
 * Error response structure
 */
function createErrorResponse(err, includeStack = false) {
  const response = {
    success: false,
    error: {
      message: err.message || 'An unexpected error occurred',
      code: err.code || 'INTERNAL_ERROR',
      statusCode: err.statusCode || 500,
    },
  };

  // Include additional details if provided
  if (err.details) {
    response.error.details = err.details;
  }

  // Include stack trace in development
  if (includeStack && err.stack) {
    response.error.stack = err.stack;
  }

  // Include timestamp
  response.error.timestamp = err.timestamp || new Date().toISOString();

  return response;
}

/**
 * Determine if error is operational (expected) or programming error
 */
function isOperationalError(error) {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
}

/**
 * Handle specific error types from libraries/frameworks
 */
function handleSpecificErrors(err) {
  // MongoDB/Mongoose errors
  if (err.name === 'CastError') {
    return new AppError('Invalid ID format', 400, 'INVALID_ID');
  }

  if (err.name === 'ValidationError' && err.errors) {
    const errors = Object.values(err.errors).map((e) => e.message);
    return new AppError('Validation failed', 400, 'VALIDATION_ERROR', errors);
  }

  if (err.code === 11000) {
    // MongoDB duplicate key error
    const field = Object.keys(err.keyPattern || {})[0] || 'record';
    return new AppError(`${field} already exists`, 409, 'DUPLICATE_KEY', { field });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return new AppError('Invalid token', 401, 'INVALID_TOKEN');
  }

  if (err.name === 'TokenExpiredError') {
    return new AppError('Token expired', 401, 'TOKEN_EXPIRED');
  }

  // Multer errors (file upload)
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return new AppError('File too large', 400, 'FILE_TOO_LARGE');
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return new AppError('Unexpected file field', 400, 'UNEXPECTED_FILE');
    }
    return new AppError('File upload error', 400, 'UPLOAD_ERROR', { code: err.code });
  }

  // Express validator errors
  if (Array.isArray(err) && err[0]?.msg) {
    const messages = err.map((e) => e.msg);
    return new AppError('Validation failed', 400, 'VALIDATION_ERROR', messages);
  }

  return null;
}

/**
 * Log error based on severity
 */
function logError(err, req) {
  const errorContext = {
    message: err.message,
    code: err.code,
    statusCode: err.statusCode,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userId: req.user?._id,
    userEmail: req.user?.email,
  };

  // Log operational errors as warnings
  if (isOperationalError(err)) {
    logger.warn('Operational error occurred', errorContext);
  } else {
    // Log programming errors as errors with full stack trace
    logger.error('Programming error occurred', {
      ...errorContext,
      stack: err.stack,
    });
  }
}

/**
 * Main error handling middleware
 */
export function errorHandler(err, req, res, next) {
  // Handle specific error types
  let error = handleSpecificErrors(err) || err;

  // Ensure error is an AppError instance
  if (!(error instanceof AppError)) {
    error = new AppError(
      error.message || 'Internal server error',
      error.statusCode || 500,
      error.code || 'INTERNAL_ERROR'
    );
  }

  // Log the error
  logError(error, req);

  // Don't expose internal errors in production
  if (process.env.NODE_ENV === 'production' && error.statusCode === 500) {
    error.message = 'Internal server error';
    error.details = undefined;
  }

  // Send error response
  const includeStack = process.env.NODE_ENV === 'development';
  const response = createErrorResponse(error, includeStack);

  res.status(error.statusCode).json(response);
}

/**
 * Handle 404 Not Found
 */
export function notFoundHandler(req, res, next) {
  const error = new AppError(
    `Route ${req.originalUrl} not found`,
    404,
    'ROUTE_NOT_FOUND',
    {
      path: req.originalUrl,
      method: req.method,
    }
  );
  next(error);
}

/**
 * Async error wrapper - catches async errors in route handlers
 * (Alternative to asyncHandler.js - can be used interchangeably)
 */
export function catchAsync(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Global unhandled rejection handler
 */
export function handleUnhandledRejection() {
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection', {
      reason: reason,
      promise: promise,
    });
    
    // In production, you might want to gracefully shutdown
    if (process.env.NODE_ENV === 'production') {
      logger.error('Unhandled rejection - shutting down gracefully');
      process.exit(1);
    }
  });
}

/**
 * Global uncaught exception handler
 */
export function handleUncaughtException() {
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception', {
      error: error.message,
      stack: error.stack,
    });
    
    // Uncaught exceptions are serious - must exit
    logger.error('Uncaught exception - shutting down');
    process.exit(1);
  });
}

export default errorHandler;
