/**
 * /api/bookings — all routes require Cognito JWT.
 */
import { Router } from 'express';
import {
  createBooking,
  createBookingValidators,
  listMyBookings,
  cancelBooking,
  cancelBookingValidators,
} from '../controllers/bookingController.js';
import { verifyCognitoToken } from '../middleware/verifyCognitoToken.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

router.use(verifyCognitoToken);

router.get('/my', asyncHandler(listMyBookings));
router.patch('/:id/cancel', cancelBookingValidators, asyncHandler(cancelBooking));
router.post('/', createBookingValidators, asyncHandler(createBooking));

export default router;
