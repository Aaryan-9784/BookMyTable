/**
 * Multer memory storage — file kept in RAM as Buffer for direct S3 PutObject (no disk I/O).
 */
import multer from 'multer';

const storage = multer.memoryStorage();

const allowed = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

function fileFilter(_req, file, cb) {
  if (allowed.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, WebP, and GIF images are allowed'));
  }
}

export const uploadImageMiddleware = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

/**
 * Wraps single('image') so Multer errors become 400 JSON instead of hanging.
 */
export function uploadSingleImage(req, res, next) {
  uploadImageMiddleware.single('image')(req, res, (err) => {
    if (!err) return next();
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large (max 5MB)' });
    }
    return res.status(400).json({ message: err.message || 'Upload failed' });
  });
}
