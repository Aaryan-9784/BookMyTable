/**
 * Bookings — create, list mine, cancel (owner); duplicate + date validation.
 */
import { validationResult, body, param } from 'express-validator';
import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Restaurant from '../models/Restaurant.js';
import { sendBookingEmail, sendCancellationEmail } from '../utils/awsSes.js';

export const createBookingValidators = [
  body('restaurantId').notEmpty().withMessage('restaurantId is required'),
  body('date').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('date must be YYYY-MM-DD'),
  body('time').trim().notEmpty().withMessage('time is required'),
  body('guests').isInt({ min: 1, max: 50 }).withMessage('guests must be 1–50'),
];

export const cancelBookingValidators = [param('id').isMongoId().withMessage('Invalid booking id')];

function isPastDate(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(`${dateStr}T12:00:00.000Z`);
  d.setHours(0, 0, 0, 0);
  return d < today;
}

/**
 * POST /api/bookings — requires valid Cognito JWT; sends confirmation email via SES.
 */
export async function createBooking(req, res, next) {
  const log = '[BookMyTable][Bookings]';
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { restaurantId, date, time, guests } = req.body;

    console.log(`${log} POST /api/bookings`, {
      userId: String(req.user._id),
      userEmail: req.user.email,
      restaurantId,
      date,
      time,
      guests: Number(guests),
    });

    if (isPastDate(date)) {
      return res.status(400).json({ message: 'Booking date cannot be in the past' });
    }

    if (!mongoose.isValidObjectId(restaurantId)) {
      return res.status(400).json({ message: 'Invalid restaurantId' });
    }

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const dup = await Booking.findOne({
      userId: req.user._id,
      restaurantId,
      date,
      time,
      status: 'confirmed',
    });
    if (dup) {
      return res.status(409).json({
        message: 'You already have a confirmed booking for this restaurant, date, and time.',
      });
    }

    let booking;
    try {
      booking = await Booking.create({
        userId: req.user._id,
        restaurantId,
        date,
        time,
        guests: Number(guests),
        status: 'confirmed',
      });
    } catch (e) {
      if (e.code === 11000) {
        return res.status(409).json({
          message: 'This time slot is already booked for you at this restaurant.',
        });
      }
      throw e;
    }

    console.log(`${log} Booking persisted in MongoDB`, {
      bookingId: String(booking._id),
      restaurant: restaurant.name,
    });

    const populated = await booking.populate('restaurantId');

    console.log(`${log} Sending confirmation email via SES (await) →`, {
      toEmail: req.user.email,
      restaurantName: restaurant.name,
    });

    const emailDelivery = await sendBookingEmail({
      toEmail: req.user.email,
      restaurantName: restaurant.name,
      date,
      time,
      guests: Number(guests),
    });

    console.log(`${log} Email delivery result`, {
      ok: emailDelivery.ok,
      messageId: emailDelivery.messageId,
      sandboxRedirect: emailDelivery.sandboxRedirect,
      deliveredTo: emailDelivery.deliveredTo,
    });

    const payload = populated.toObject ? populated.toObject() : populated;
    res.status(201).json({ ...payload, emailDelivery });
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
      .sort({ date: 1, time: 1 })
      .populate('restaurantId')
      .lean();
    res.json(list);
  } catch (e) {
    next(e);
  }
}

/**
 * PATCH /api/bookings/:id/cancel — owner only; sends cancellation email.
 */
export async function cancelBooking(req, res, next) {
  const log = '[BookMyTable][Bookings]';
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const booking = await Booking.findById(req.params.id).populate('restaurantId');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (!booking.userId.equals(req.user._id)) {
      return res.status(403).json({ message: 'You can only cancel your own bookings' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }

    booking.status = 'cancelled';
    await booking.save();

    const restName =
      booking.restaurantId && typeof booking.restaurantId === 'object' && booking.restaurantId.name
        ? booking.restaurantId.name
        : 'Restaurant';

    console.log(`${log} PATCH cancel ${req.params.id} → sending cancellation email`);

    const emailDelivery = await sendCancellationEmail({
      toEmail: req.user.email,
      restaurantName: restName,
      date: booking.date,
      time: booking.time,
      guests: booking.guests,
    });

    console.log(`${log} Cancellation email result`, emailDelivery);

    const plain = booking.toObject ? booking.toObject() : booking;
    res.json({ ...plain, emailDelivery });
  } catch (e) {
    next(e);
  }
}
