/**
 * One-off: delete restaurant documents by exact name (case-insensitive).
 * Also removes bookings that reference those restaurants.
 * Usage: node scripts/removeRestaurantsByName.js "The Golden Fork"
 */
import '../loadEnv.js';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Restaurant from '../models/Restaurant.js';
import Booking from '../models/Booking.js';

const nameArg = process.argv.slice(2).join(' ').trim() || 'The Golden Fork';
const escaped = nameArg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const nameRegex = new RegExp(`^${escaped}$`, 'i');

await connectDB();

const toRemove = await Restaurant.find({ name: nameRegex }).select('_id').lean();
const ids = toRemove.map((r) => r._id);

let bookingsDeleted = 0;
if (ids.length) {
  const br = await Booking.deleteMany({ restaurantId: { $in: ids } });
  bookingsDeleted = br.deletedCount;
}

const result = await Restaurant.deleteMany({ _id: { $in: ids } });

console.log(
  `Removed ${result.deletedCount} restaurant(s) matching "${nameArg}" (${bookingsDeleted} associated booking(s) removed)`
);

await mongoose.connection.close();
process.exit(0);
