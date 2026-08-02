/**
 * Booking Validation Utilities
 * 
 * Comprehensive validation for booking operations:
 * - Date and time validation
 * - Restaurant capacity checks
 * - Operating hours verification
 * - Double booking prevention
 * - Guest count validation
 */

import { ValidationError } from './AppError.js';
import Restaurant from '../models/Restaurant.js';
import Booking from '../models/Booking.js';
import Table from '../models/Table.js';
import { createLogger } from './logger.js';

const logger = createLogger('BookingValidator');

/**
 * Validate booking date
 */
export function validateBookingDate(dateStr) {
  // Check format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateStr)) {
    throw new ValidationError('Invalid date format. Use YYYY-MM-DD');
  }

  const bookingDate = new Date(`${dateStr}T00:00:00.000Z`);
  
  // Check if valid date
  if (isNaN(bookingDate.getTime())) {
    throw new ValidationError('Invalid date');
  }

  // Check if date is in the past (use local date string comparison to avoid UTC timezone issues)
  const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD in local timezone
  if (dateStr < todayStr) {
    throw new ValidationError('Booking date cannot be in the past');
  }

  // Check if date is too far in the future (e.g., max 90 days)
  const maxDaysAhead = 90;
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + maxDaysAhead);
  
  if (bookingDate > maxDate) {
    throw new ValidationError(`Bookings can only be made up to ${maxDaysAhead} days in advance`);
  }

  return bookingDate;
}

/**
 * Validate booking time
 */
export function validateBookingTime(timeStr) {
  // Check format (HH:MM or HH:MM:SS)
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/;
  if (!timeRegex.test(timeStr)) {
    throw new ValidationError('Invalid time format. Use HH:MM (24-hour format)');
  }

  return timeStr;
}

/**
 * Validate date and time are not in the past
 */
export function validateDateTimeNotPast(dateStr, timeStr) {
  const todayStr = new Date().toLocaleDateString('en-CA');
  if (dateStr < todayStr) {
    throw new ValidationError('Booking date cannot be in the past');
  }
  return true;
}

/**
 * Validate guest count
 */
export function validateGuestCount(guests, restaurantCapacity = null) {
  const guestCount = Number(guests);
  
  if (!Number.isInteger(guestCount) || guestCount < 1) {
    throw new ValidationError('Number of guests must be at least 1');
  }

  if (guestCount > 500) {
    throw new ValidationError('Number of guests cannot exceed 500. Please contact the restaurant for very large parties');
  }

  if (restaurantCapacity && guestCount > restaurantCapacity) {
    throw new ValidationError(
      `Number of guests exceeds restaurant capacity of ${restaurantCapacity}`,
      { maxCapacity: restaurantCapacity }
    );
  }

  return guestCount;
}

/**
 * Check if restaurant is open on the given date and time
 */
export async function validateRestaurantOperatingHours(restaurant, date, time) {
  // If restaurant doesn't have operating hours defined, allow booking
  if (!restaurant.openingHours || typeof restaurant.openingHours !== 'string') {
    return true;
  }

  const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
  const openingHours = restaurant.openingHours.toLowerCase();
  
  // Check if restaurant is closed on this day
  if (openingHours.includes('closed') && openingHours.includes(dayOfWeek.toLowerCase())) {
    throw new ValidationError(`Restaurant is closed on ${dayOfWeek}s`);
  }

  // Basic time validation (can be enhanced with detailed hour parsing)
  // For now, just warn if booking is very early or very late
  const [hour] = time.split(':').map(Number);
  
  if (hour < 6 || hour > 23) {
    logger.warn('Unusual booking time', { time, restaurant: restaurant.name });
  }

  return true;
}

/**
 * Check restaurant capacity for the given time slot
 */
/**
 * Check restaurant capacity and table assignment for the given time slot
 */
export async function validateRestaurantCapacity(restaurantId, date, time, guests, preferredTableId = null) {
  const restaurant = await Restaurant.findById(restaurantId);
  
  if (!restaurant) {
    throw new ValidationError('Restaurant not found');
  }

  const requestedGuests = Number(guests) || 1;

  // 1. Fetch registered table inventory for this restaurant
  const tables = await Table.find({ restaurantId }).lean();

  // 2. Fetch active bookings for this date & time
  const existingBookings = await Booking.find({
    restaurantId,
    date,
    time,
    status: { $in: ['confirmed', 'checked-in'] },
  }).lean();

  // Calculate total guests already booked
  const totalGuestsBooked = existingBookings.reduce((sum, b) => sum + (Number(b.guests) || 0), 0);

  // Reserved table IDs for this slot
  const reservedTableIds = existingBookings
    .map((b) => (b.tableId ? String(b.tableId) : null))
    .filter(Boolean);

  let assignedTable = null;

  if (tables.length > 0) {
    // Restaurant has configured physical tables
    const availableTables = tables.filter(
      (t) => !reservedTableIds.includes(String(t._id)) && t.status !== 'Maintenance'
    );

    const totalAvailableCapacity = availableTables.reduce(
      (acc, t) => acc + (Number(t.capacity) || 0),
      0
    );
    const totalInventoryCapacity = tables.reduce(
      (acc, t) => acc + (Number(t.capacity) || 0),
      0
    );

    if (totalAvailableCapacity < requestedGuests) {
      throw new ValidationError(
        `Not enough table capacity available. Only ${totalAvailableCapacity} seat(s) left for this time slot (Requested: ${requestedGuests} guests).`,
        {
          availableSeats: totalAvailableCapacity,
          requestedGuests,
          totalCapacity: totalInventoryCapacity,
        }
      );
    }

    if (preferredTableId) {
      const targetTable = availableTables.find((t) => String(t._id) === String(preferredTableId));
      if (!targetTable) {
        throw new ValidationError('Selected table is no longer available for this time slot.');
      }
      if (Number(targetTable.capacity) < requestedGuests) {
        throw new ValidationError(
          `Selected table (${targetTable.tableNumber}, ${targetTable.capacity}-seater) cannot accommodate ${requestedGuests} guests.`
        );
      }
      assignedTable = targetTable;
    } else {
      // Find candidate tables with capacity >= requestedGuests, sorted by capacity asc
      const candidateTables = availableTables
        .filter((t) => Number(t.capacity) >= requestedGuests)
        .sort((a, b) => Number(a.capacity) - Number(b.capacity));

      if (candidateTables.length > 0) {
        assignedTable = candidateTables[0];
      } else {
        const maxSingleCap = Math.max(...availableTables.map((t) => Number(t.capacity) || 0), 0);
        throw new ValidationError(
          `No single table available for ${requestedGuests} guests. Maximum available single table capacity is ${maxSingleCap} seats.`
        );
      }
    }

    return {
      available: true,
      totalCapacity: totalInventoryCapacity,
      bookedSeats: totalGuestsBooked,
      availableSeats: totalAvailableCapacity,
      assignedTable,
    };
  } else {
    // Fallback if no tables in Table collection
    const restaurantCapacity = Number(restaurant.totalSeatingCapacity || restaurant.capacity) || 100;
    const totalAfterBooking = totalGuestsBooked + requestedGuests;

    if (totalAfterBooking > restaurantCapacity) {
      const availableSeats = Math.max(0, restaurantCapacity - totalGuestsBooked);
      throw new ValidationError(
        `Not enough capacity. Only ${availableSeats} seat(s) available at this time.`,
        {
          availableSeats,
          requestedGuests,
          totalCapacity: restaurantCapacity,
        }
      );
    }

    assignedTable = {
      _id: null,
      tableNumber: 'T-01',
      capacity: restaurantCapacity,
      zone: 'Main Hall',
    };

    return {
      available: true,
      totalCapacity: restaurantCapacity,
      bookedSeats: totalGuestsBooked,
      availableSeats: restaurantCapacity - totalGuestsBooked,
      assignedTable,
    };
  }
}

/**
 * Check for duplicate bookings by the same user
 */
export async function validateNoDuplicateBooking(userId, restaurantId, date, time) {
  const existingBooking = await Booking.findOne({
    userId,
    restaurantId,
    date,
    time,
    status: 'confirmed',
  });

  if (existingBooking) {
    return existingBooking;
  }

  return null;
}

/**
 * Prevent users from having too many active bookings
 */
export async function validateUserBookingLimit(userId, limit = 50) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const activeBookingsCount = await Booking.countDocuments({
    userId,
    status: 'confirmed',
    date: { $gte: today.toISOString().split('T')[0] },
  });

  if (activeBookingsCount >= limit) {
    throw new ValidationError(
      `You have reached the maximum limit of ${limit} active bookings`,
      {
        currentBookings: activeBookingsCount,
        maxBookings: limit,
      }
    );
  }

  return true;
}

/**
 * Validate minimum advance booking time (e.g., must book at least 1 hour ahead)
 */
export function validateMinimumAdvanceTime(dateStr, timeStr, minimumHours = 1) {
  const bookingDateTime = new Date(`${dateStr}T${timeStr}:00`);
  const now = new Date();
  const hoursDifference = (bookingDateTime - now) / (1000 * 60 * 60);

  if (hoursDifference < minimumHours) {
    throw new ValidationError(
      `Bookings must be made at least ${minimumHours} hour(s) in advance`,
      {
        minimumHours,
        hoursUntilBooking: hoursDifference.toFixed(1),
      }
    );
  }

  return true;
}

/**
 * Validate special requests (if provided)
 */
export function validateSpecialRequests(specialRequests) {
  if (!specialRequests) {
    return null;
  }

  const trimmed = specialRequests.trim();
  
  if (trimmed.length > 500) {
    throw new ValidationError('Special requests cannot exceed 500 characters');
  }

  // Already sanitized by inputSanitizer middleware
  return trimmed;
}

/**
 * Comprehensive booking validation
 * Runs all validation checks in sequence
 */
export async function validateBooking(bookingData, userId) {
  const { restaurantId, date, time, guests, specialRequests, tableId } = bookingData;

  logger.info('Validating booking', { userId, restaurantId, date, time, guests, tableId });

  // 1. Validate date format and range
  validateBookingDate(date);

  // 2. Validate time format
  validateBookingTime(time);

  // 3. Validate date/time is not in the past
  validateDateTimeNotPast(date, time);

  // 4. Validate minimum advance booking time (0 minutes minimum)
  validateMinimumAdvanceTime(date, time, 0);

  // 5. Validate guest count
  validateGuestCount(guests);

  // 6. Check restaurant exists and get details
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) {
    throw new ValidationError('Restaurant not found');
  }

  // 7. Validate restaurant is open
  await validateRestaurantOperatingHours(restaurant, date, time);

  // 8. Validate restaurant capacity & assign table
  const capacityResult = await validateRestaurantCapacity(restaurantId, date, time, guests, tableId);

  // 9. Check for duplicate bookings
  const existingBooking = await validateNoDuplicateBooking(userId, restaurantId, date, time);

  // 10. Check user booking limit
  await validateUserBookingLimit(userId, 50);

  // 11. Validate special requests (if any)
  const validatedRequests = validateSpecialRequests(specialRequests);

  const assignedTable = capacityResult.assignedTable || null;

  logger.info('Booking validation passed', {
    userId,
    restaurantId,
    assignedTable: assignedTable?.tableNumber,
  });

  return {
    valid: true,
    restaurant,
    existingBooking: existingBooking || null,
    validatedData: {
      restaurantId,
      date,
      time,
      guests: Number(guests),
      specialRequests: validatedRequests,
      tableId: assignedTable?._id || null,
      tableNumber: assignedTable?.tableNumber || null,
      tableCapacity: assignedTable?.capacity || null,
      tableZone: assignedTable?.zone || null,
    },
  };
}

/**
 * Validate booking cancellation
 */
export async function validateCancellation(bookingId, userId, isAdmin = false) {
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new ValidationError('Booking not found');
  }

  // Check ownership (unless admin)
  if (!isAdmin && booking.userId.toString() !== userId.toString()) {
    throw new ValidationError('You can only cancel your own bookings', {
      code: 'UNAUTHORIZED_CANCELLATION',
    });
  }

  // Check if already cancelled
  if (booking.status === 'cancelled') {
    throw new ValidationError('Booking is already cancelled');
  }

  // Check if booking is in the past
  const bookingDateTime = new Date(`${booking.date}T${booking.time}:00`);
  const now = new Date();
  
  if (bookingDateTime < now) {
    throw new ValidationError('Cannot cancel a booking that has already passed');
  }

  // Optionally: prevent cancellation too close to booking time
  const hoursUntilBooking = (bookingDateTime - now) / (1000 * 60 * 60);
  const minimumCancellationHours = 2;
  
  if (hoursUntilBooking < minimumCancellationHours && !isAdmin) {
    throw new ValidationError(
      `Bookings cannot be cancelled less than ${minimumCancellationHours} hours before the scheduled time`,
      {
        hoursUntilBooking: hoursUntilBooking.toFixed(1),
        minimumHours: minimumCancellationHours,
      }
    );
  }

  return { valid: true, booking };
}

export default {
  validateBookingDate,
  validateBookingTime,
  validateDateTimeNotPast,
  validateGuestCount,
  validateRestaurantOperatingHours,
  validateRestaurantCapacity,
  validateNoDuplicateBooking,
  validateUserBookingLimit,
  validateMinimumAdvanceTime,
  validateSpecialRequests,
  validateBooking,
  validateCancellation,
};
