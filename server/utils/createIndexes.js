/**
 * Database Index Creation
 * 
 * Creates indexes for improved query performance.
 */

import { createLogger } from './logger.js';
import Booking from '../models/Booking.js';
import Restaurant from '../models/Restaurant.js';
import User from '../models/User.js';

const logger = createLogger('Indexes');

/**
 * Create all database indexes
 */
export async function createDatabaseIndexes() {
  try {
    logger.info('Creating database indexes...');

    // Booking indexes
    await Booking.createIndexes([
      { userId: 1, date: -1 }, // User's bookings sorted by date
      { restaurantId: 1, date: 1, time: 1 }, // Restaurant availability
      { status: 1, date: 1 }, // Active bookings
      { date: 1, status: 1 }, // Date-based queries
    ]);

    // Restaurant indexes
    await Restaurant.createIndexes([
      { name: 'text', description: 'text' }, // Text search
      { location: 1 }, // Location-based queries
      { cuisine: 1 }, // Filter by cuisine
      { status: 1 }, // Filter by status
    ]);

    // User indexes
    await User.createIndexes([
      { email: 1 }, // Email lookup (unique)
      { role: 1 }, // Role-based queries
      { createdAt: -1 }, // Sort by registration date
    ]);

    logger.info('Database indexes created successfully');
  } catch (error) {
    logger.error('Failed to create indexes', { error: error.message });
  }
}

export default createDatabaseIndexes;
