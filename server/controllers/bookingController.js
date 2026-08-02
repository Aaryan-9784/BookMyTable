/**
 * Bookings — create, list mine, cancel (owner); comprehensive validation.
 */
import mongoose from 'mongoose';
import { validationResult, body, param } from 'express-validator';
import Booking from '../models/Booking.js';
import { sendBookingEmail, sendCancellationEmail } from '../utils/resendEmail.js';
import { pushToUser } from '../utils/sseManager.js';
import { createLogger } from '../utils/logger.js';
import { validateBooking, validateCancellation } from '../utils/bookingValidator.js';
import { assertExists } from '../utils/errorHelpers.js';

const logger = createLogger('Bookings');

export const createBookingValidators = [
  body('restaurantId').notEmpty().withMessage('restaurantId is required').isMongoId().withMessage('Invalid restaurant ID'),
  body('date').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('date must be YYYY-MM-DD'),
  body('time').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('time must be HH:MM (24-hour format)'),
  body('guests').isInt({ min: 1, max: 500 }).withMessage('guests must be between 1 and 500'),
  body('specialRequests').optional().isString().isLength({ max: 500 }).withMessage('Special requests cannot exceed 500 characters'),
];

export const cancelBookingValidators = [
  param('id').isMongoId().withMessage('Invalid booking id')
];

/**
 * POST /api/bookings — requires valid JWT; comprehensive validation; sends confirmation email.
 */
export async function createBooking(req, res, next) {
  try {
    // Check express-validator errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const { restaurantId, date, time, guests, specialRequests, paymentId, couponCode, discountAmount, finalPayable } = req.body;

    logger.info('Creating booking', {
      userId: String(req.user._id),
      userEmail: req.user.email,
      restaurantId,
      date,
      time,
      guests,
      paymentId,
    });

    // Run comprehensive validation
    const validation = await validateBooking(
      { restaurantId, date, time, guests, specialRequests },
      req.user._id
    );

    const { restaurant, validatedData, existingBooking } = validation;

    if (existingBooking) {
      logger.info('Duplicate booking request - returning existing booking', {
        bookingId: String(existingBooking._id),
      });
      const populatedBooking = await existingBooking.populate('restaurantId');
      const payload = populatedBooking.toObject ? populatedBooking.toObject() : populatedBooking;
      return res.status(200).json({ 
        success: true,
        data: payload,
        message: 'Table reservation already confirmed'
      });
    }

    // Create booking
    const booking = await Booking.create({
      userId: req.user._id,
      ...validatedData,
      paymentId: paymentId || `pay_sim_${Date.now()}`,
      couponCode: couponCode || null,
      discountAmount: Number(discountAmount) || 0,
      finalPayable: Number(finalPayable) || 0,
      status: 'confirmed',
    });

    logger.info('Booking created successfully', {
      bookingId: String(booking._id),
      restaurant: restaurant.name,
    });

    // Populate restaurant details for response
    const populatedBooking = await booking.populate('restaurantId');

    // Send confirmation email with full payment details
    logger.info('Sending booking confirmation email');
    let emailDelivery;
    try {
      emailDelivery = await sendBookingEmail({
        toEmail: req.user.email,
        restaurantName: restaurant.name,
        date: validatedData.date,
        time: validatedData.time,
        guests: validatedData.guests,
        bookingId: String(booking._id),
        paymentId: booking.paymentId,
        finalPayable: booking.finalPayable,
        discountAmount: booking.discountAmount,
        couponCode: booking.couponCode,
      });

      if (emailDelivery.ok) {
        logger.info('Confirmation email sent successfully', {
          messageId: emailDelivery.messageId,
        });
      } else if (emailDelivery.devMode) {
        logger.warn('Email not sent - development mode');
      } else {
        logger.warn('Email delivery failed but booking created', {
          reason: emailDelivery.reason,
        });
      }
    } catch (emailError) {
      logger.error('Email service error', { error: emailError.message });
      emailDelivery = { 
        ok: false, 
        reason: emailError.message,
        message: 'Booking created but email notification failed'
      };
    }

    // Send real-time notification
    pushToUser(String(req.user._id), {
      id: Date.now(),
      type: 'booking_confirmed',
      title: 'Booking Confirmed ✓',
      desc: `Your table at ${restaurant.name} is confirmed for ${date} at ${time} (${guests} guest${guests > 1 ? 's' : ''}). Payment Ref: ${booking.paymentId}.`,
      time: 'Just now',
      unread: true,
    });

    const payload = populatedBooking.toObject ? populatedBooking.toObject() : populatedBooking;

    res.status(201).json({ 
      success: true,
      data: payload,
      emailDelivery 
    });
  } catch (e) {
    logger.error('createBooking failed', {
      errorName: e.name,
      errorMessage: e.message,
      errorCode: e.code,
      stack: e.stack?.split('\n').slice(0, 5).join(' | '),
    });
    next(e);
  }
}

/**
 * GET /api/bookings/:id — single booking details by ID.
 */
export async function getBookingById(req, res, next) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID',
      });
    }

    const booking = await Booking.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).populate('restaurantId');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    res.json({
      success: true,
      data: booking,
    });
  } catch (e) {
    next(e);
  }
}

/**
 * GET /api/bookings/my — bookings for authenticated user, restaurant populated.
 */
export async function listMyBookings(req, res, next) {
  try {
    const list = await Booking.find({ userId: req.user._id })
      .sort({ date: -1, time: -1 }) // Most recent first
      .populate('restaurantId')
      .lean();
    
    res.json({ 
      success: true,
      data: list,
      count: list.length 
    });
  } catch (e) {
    next(e);
  }
}

/**
 * PATCH /api/bookings/:id/cancel — owner only; comprehensive validation; sends cancellation email.
 */
export async function cancelBooking(req, res, next) {
  try {
    // Check express-validator errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const bookingId = req.params.id;
    const userId = req.user._id;

    logger.info('Cancelling booking', { bookingId, userId: String(userId) });

    // Validate cancellation
    const { booking } = await validateCancellation(bookingId, userId, false);

    // Populate restaurant for email
    await booking.populate('restaurantId');

    const restName = booking.restaurantId?.name || 'Restaurant';

    // Update booking status
    booking.status = 'cancelled';
    await booking.save();

    logger.info('Booking cancelled successfully', {
      bookingId,
      restaurant: restName,
    });

    // Send cancellation email
    logger.info('Sending cancellation notification email');
    let emailDelivery;
    try {
      emailDelivery = await sendCancellationEmail({
        toEmail: req.user.email,
        restaurantName: restName,
        date: booking.date,
        time: booking.time,
        guests: booking.guests,
      });

      if (emailDelivery.ok) {
        logger.info('Cancellation email sent successfully');
      } else if (emailDelivery.devMode) {
        logger.warn('Email not sent - development mode');
      } else {
        logger.warn('Cancellation email failed', { reason: emailDelivery.reason });
      }
    } catch (emailError) {
      logger.error('Email service error during cancellation', { error: emailError.message });
      emailDelivery = { 
        ok: false, 
        reason: emailError.message,
        message: 'Booking cancelled but email notification failed'
      };
    }

    // Send real-time notification
    pushToUser(String(userId), {
      id: Date.now(),
      type: 'booking_cancelled',
      title: 'Booking Cancelled',
      desc: `Your reservation at ${restName} on ${booking.date} at ${booking.time} has been cancelled.`,
      time: 'Just now',
      unread: true,
    });

    const payload = booking.toObject ? booking.toObject() : booking;

    res.json({ 
      success: true,
      message: 'Booking cancelled successfully',
      data: payload,
      emailDelivery 
    });
  } catch (e) {
    next(e);
  }
}
