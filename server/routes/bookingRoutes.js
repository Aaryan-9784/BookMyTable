/**
 * /api/bookings — all routes require Cognito JWT.
 * Protected with rate limiting to prevent booking spam.
 * CSRF protection on state-changing operations.
 * Input sanitization to prevent XSS in booking notes/requests.
 */
import { Router } from 'express';
import {
  createBooking,
  createBookingValidators,
  listMyBookings,
  getBookingById,
  cancelBooking,
  cancelBookingValidators,
} from '../controllers/bookingController.js';
import { verifyCognitoToken } from '../middleware/verifyCognitoToken.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { bookingLimiter } from '../middleware/rateLimiter.js';
import { conditionalCsrfProtection } from '../middleware/csrfProtection.js';
import { createSanitizationMiddleware } from '../middleware/inputSanitizer.js';

const router = Router();

// Apply input sanitization to booking data
const sanitizeBooking = createSanitizationMiddleware('booking');

router.use(verifyCognitoToken);

// Safe methods - no CSRF needed
router.get('/my', asyncHandler(listMyBookings));
router.get('/:id', asyncHandler(getBookingById));

// State-changing operations - CSRF protection in production
router.patch('/:id/cancel', conditionalCsrfProtection, cancelBookingValidators, asyncHandler(cancelBooking));

// Rate limit: 10 bookings per hour per IP + CSRF protection + input sanitization
router.post('/', bookingLimiter, conditionalCsrfProtection, sanitizeBooking, createBookingValidators, asyncHandler(createBooking));

export default router;
