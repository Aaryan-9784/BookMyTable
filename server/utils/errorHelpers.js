/**
 * Error Helper Functions
 * 
 * Convenient utilities for throwing common errors in controllers
 */

import AppError, {
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  DatabaseError,
  ExternalServiceError,
} from './AppError.js';

/**
 * Assert condition is true, otherwise throw error
 */
export function assert(condition, message, statusCode = 400, code = 'ASSERTION_FAILED') {
  if (!condition) {
    throw new AppError(message, statusCode, code);
  }
}

/**
 * Throw validation error with details
 */
export function throwValidationError(message, details = null) {
  throw new ValidationError(message, details);
}

/**
 * Throw authentication error
 */
export function throwAuthError(message = 'Authentication required') {
  throw new AuthenticationError(message);
}

/**
 * Throw authorization error
 */
export function throwForbiddenError(message = 'Access denied') {
  throw new AuthorizationError(message);
}

/**
 * Throw not found error
 */
export function throwNotFoundError(resource = 'Resource') {
  throw new NotFoundError(resource);
}

/**
 * Throw conflict error
 */
export function throwConflictError(message = 'Resource already exists') {
  throw new ConflictError(message);
}

/**
 * Throw database error
 */
export function throwDatabaseError(message = 'Database operation failed', details = null) {
  throw new DatabaseError(message, details);
}

/**
 * Throw external service error
 */
export function throwServiceError(service = 'External service', details = null) {
  throw new ExternalServiceError(service, details);
}

/**
 * Assert resource exists, otherwise throw not found error
 */
export function assertExists(resource, resourceName = 'Resource') {
  if (!resource) {
    throwNotFoundError(resourceName);
  }
  return resource;
}

/**
 * Assert user is authorized, otherwise throw forbidden error
 */
export function assertAuthorized(condition, message = 'Access denied') {
  if (!condition) {
    throwForbiddenError(message);
  }
}

/**
 * Assert valid input, otherwise throw validation error
 */
export function assertValid(condition, message, details = null) {
  if (!condition) {
    throwValidationError(message, details);
  }
}

/**
 * Wrap database operations with error handling
 */
export async function withDatabaseErrorHandling(operation, errorMessage = 'Database operation failed') {
  try {
    return await operation();
  } catch (error) {
    throwDatabaseError(errorMessage, { originalError: error.message });
  }
}

/**
 * Wrap external service calls with error handling
 */
export async function withServiceErrorHandling(operation, serviceName = 'External service') {
  try {
    return await operation();
  } catch (error) {
    throwServiceError(serviceName, { originalError: error.message });
  }
}

export default {
  assert,
  throwValidationError,
  throwAuthError,
  throwForbiddenError,
  throwNotFoundError,
  throwConflictError,
  throwDatabaseError,
  throwServiceError,
  assertExists,
  assertAuthorized,
  assertValid,
  withDatabaseErrorHandling,
  withServiceErrorHandling,
};
