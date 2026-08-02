/**
 * Development Authentication Routes
 * 
 * ⚠️ CRITICAL: These routes are ONLY for local development
 * They are automatically disabled in production environments
 */
import { Router } from 'express';
import { devLogin, devSignup } from '../controllers/devAuthController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { passwordValidationMiddleware } from '../middleware/passwordValidator.js';

const router = Router();

/**
 * Middleware to ensure dev auth is only available in development
 */
function requireDevelopmentMode(req, res, next) {
  const isProduction = process.env.NODE_ENV === 'production';
  const devAuthEnabled = process.env.DEV_AUTH_ENABLED !== 'false';

  if (isProduction) {
    return res.status(403).json({
      message: 'Development authentication endpoints are disabled in production',
      error: 'FORBIDDEN',
    });
  }

  if (!devAuthEnabled) {
    return res.status(403).json({
      message: 'Development authentication is not enabled. Set DEV_AUTH_ENABLED=true in your .env file.',
      error: 'NOT_ENABLED',
    });
  }

  // Log warning for dev auth usage
  console.warn('[DEV AUTH] Development authentication endpoint accessed. This should never happen in production!');
  
  next();
}

// Apply development mode check to all routes
router.use(requireDevelopmentMode);

/**
 * POST /api/dev-auth/login
 * Development login with server-signed JWT
 */
router.post('/login', asyncHandler(devLogin));

/**
 * POST /api/dev-auth/signup
 * Development signup with server-signed JWT
 */
router.post('/signup', passwordValidationMiddleware, asyncHandler(devSignup));

export default router;
