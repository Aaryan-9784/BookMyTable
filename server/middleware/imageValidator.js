/**
 * Image Upload Validation Middleware
 * 
 * Validates uploaded images for security and quality.
 */

import { createLogger } from '../utils/logger.js';
import { ValidationError } from '../utils/AppError.js';

const logger = createLogger('ImageValidator');

// Allowed MIME types
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
];

// Max file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Image dimensions
const MIN_WIDTH = 100;
const MIN_HEIGHT = 100;
const MAX_WIDTH = 4000;
const MAX_HEIGHT = 4000;

/**
 * Validate image MIME type
 */
function validateMimeType(file) {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    throw new ValidationError(
      `Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`,
      { allowedTypes: ALLOWED_MIME_TYPES, receivedType: file.mimetype }
    );
  }
}

/**
 * Validate file size
 */
function validateFileSize(file) {
  if (file.size > MAX_FILE_SIZE) {
    throw new ValidationError(
      `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
      { maxSize: MAX_FILE_SIZE, receivedSize: file.size }
    );
  }
}

/**
 * Validate file extension matches MIME type
 */
function validateExtension(file) {
  const allowedExtensions = {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/webp': ['.webp'],
    'image/gif': ['.gif'],
  };

  const ext = file.originalname.toLowerCase().match(/\.[^.]+$/)?.[0];
  const expectedExts = allowedExtensions[file.mimetype];

  if (!expectedExts || !expectedExts.includes(ext)) {
    throw new ValidationError(
      'File extension does not match MIME type',
      { mimetype: file.mimetype, extension: ext }
    );
  }
}

/**
 * Main image validation middleware
 */
export function validateImage(req, res, next) {
  try {
    const file = req.file;

    if (!file) {
      return next(); // No file uploaded, skip validation
    }

    logger.info('Validating uploaded image', {
      filename: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    });

    // Run validations
    validateMimeType(file);
    validateFileSize(file);
    validateExtension(file);

    logger.info('Image validation passed', { filename: file.originalname });
    next();
  } catch (error) {
    logger.error('Image validation failed', {
      error: error.message,
      filename: req.file?.originalname,
    });
    next(error);
  }
}

/**
 * Multer file filter function
 */
export function imageFileFilter(req, file, cb) {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ValidationError(`Invalid file type: ${file.mimetype}`), false);
  }
}

export default {
  validateImage,
  imageFileFilter,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE,
};
