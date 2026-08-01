/**
 * Example Controller Demonstrating Standardized Error Handling
 * 
 * This file shows how to use the new error handling utilities
 * in your controllers for consistent error responses.
 */

import { asyncHandler } from '../middleware/asyncHandler.js';
import {
  assertExists,
  assertAuthorized,
  assertValid,
  throwValidationError,
  throwNotFoundError,
  withDatabaseErrorHandling,
} from '../utils/errorHelpers.js';
import AppError from '../utils/AppError.js';

// ============================================================================
// EXAMPLE 1: Basic error throwing
// ============================================================================

export const exampleBasicError = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Find resource
  const resource = await Resource.findById(id);
  
  // Throw 404 if not found
  if (!resource) {
    throwNotFoundError('Resource');
  }
  
  res.json({ success: true, data: resource });
});

// ============================================================================
// EXAMPLE 2: Using assertExists helper
// ============================================================================

export const exampleAssertExists = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const resource = await Resource.findById(id);
  
  // This will automatically throw NotFoundError if resource is null/undefined
  assertExists(resource, 'Resource');
  
  res.json({ success: true, data: resource });
});

// ============================================================================
// EXAMPLE 3: Authorization checks
// ============================================================================

export const exampleAuthorization = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const booking = await Booking.findById(id);
  assertExists(booking, 'Booking');
  
  // Check if user owns this booking
  const isOwner = booking.userId.toString() === req.user._id.toString();
  assertAuthorized(isOwner, 'You can only cancel your own bookings');
  
  // Proceed with operation
  booking.status = 'cancelled';
  await booking.save();
  
  res.json({ success: true, message: 'Booking cancelled' });
});

// ============================================================================
// EXAMPLE 4: Validation errors with details
// ============================================================================

export const exampleValidation = asyncHandler(async (req, res) => {
  const { date, guests } = req.body;
  
  // Check if date is in the past
  const isPast = new Date(date) < new Date();
  assertValid(!isPast, 'Booking date cannot be in the past');
  
  // Check guests range
  if (guests < 1 || guests > 50) {
    throwValidationError('Invalid number of guests', {
      field: 'guests',
      value: guests,
      min: 1,
      max: 50,
    });
  }
  
  res.json({ success: true, message: 'Validation passed' });
});

// ============================================================================
// EXAMPLE 5: Database error handling
// ============================================================================

export const exampleDatabaseError = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params;
  
  // Wrap database operations that might fail
  const bookings = await withDatabaseErrorHandling(
    () => Booking.find({ restaurantId }).populate('userId'),
    'Failed to fetch bookings'
  );
  
  res.json({ success: true, data: bookings });
});

// ============================================================================
// EXAMPLE 6: Custom error with specific status code
// ============================================================================

export const exampleCustomError = asyncHandler(async (req, res) => {
  const { restaurantId, date, time } = req.body;
  
  // Check for duplicate booking
  const existing = await Booking.findOne({
    restaurantId,
    date,
    time,
    status: 'confirmed',
  });
  
  if (existing) {
    throw new AppError(
      'This time slot is already booked',
      409,
      'DUPLICATE_BOOKING',
      { date, time, restaurantId }
    );
  }
  
  res.json({ success: true, message: 'Time slot available' });
});

// ============================================================================
// EXAMPLE 7: Multiple validation checks
// ============================================================================

export const exampleMultipleValidations = asyncHandler(async (req, res) => {
  const { restaurantId, date, time, guests } = req.body;
  
  // Validate restaurant exists
  const restaurant = await Restaurant.findById(restaurantId);
  assertExists(restaurant, 'Restaurant');
  
  // Validate date
  assertValid(date && /^\d{4}-\d{2}-\d{2}$/.test(date), 'Invalid date format. Use YYYY-MM-DD');
  assertValid(new Date(date) >= new Date(), 'Date cannot be in the past');
  
  // Validate guests
  assertValid(guests >= 1 && guests <= 50, 'Guests must be between 1 and 50');
  
  // Validate time slot availability
  const isAvailable = await checkTimeSlotAvailability(restaurantId, date, time);
  assertValid(isAvailable, 'This time slot is not available');
  
  // Create booking
  const booking = await Booking.create({
    userId: req.user._id,
    restaurantId,
    date,
    time,
    guests,
    status: 'confirmed',
  });
  
  res.status(201).json({ success: true, data: booking });
});

// ============================================================================
// RESPONSE FORMAT
// ============================================================================

/*
 * SUCCESS RESPONSE:
 * {
 *   "success": true,
 *   "data": { ... },
 *   "message": "Optional success message"
 * }
 * 
 * ERROR RESPONSE:
 * {
 *   "success": false,
 *   "error": {
 *     "message": "Error description",
 *     "code": "ERROR_CODE",
 *     "statusCode": 400,
 *     "details": { ... },  // Optional
 *     "timestamp": "2026-08-02T..."
 *   }
 * }
 */
