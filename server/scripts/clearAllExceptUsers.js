/**
 * Script to clear all project data (Bookings, Tables, Restaurants, etc.)
 * while keeping all User accounts and database schemas completely intact.
 *
 * Usage: node scripts/clearAllExceptUsers.js
 */
import '../loadEnv.js';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Restaurant from '../models/Restaurant.js';
import Table from '../models/Table.js';
import Booking from '../models/Booking.js';

async function clearData() {
  console.log('[ClearData] Connecting to Database...');
  await connectDB();

  // 1. Delete all Bookings
  const bookingRes = await Booking.deleteMany({});
  console.log(`[ClearData] Deleted ${bookingRes.deletedCount} booking(s).`);

  // 2. Delete all Tables
  const tableRes = await Table.deleteMany({});
  console.log(`[ClearData] Deleted ${tableRes.deletedCount} table(s).`);

  // 3. Delete all Restaurants
  const restaurantRes = await Restaurant.deleteMany({});
  console.log(`[ClearData] Deleted ${restaurantRes.deletedCount} restaurant(s).`);

  // 4. Clear any other non-system collections except users
  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();
  for (const { name } of collections) {
    if (name.startsWith('system.') || name === 'users' || name === 'restaurants' || name === 'tables' || name === 'bookings') {
      continue;
    }
    const res = await db.collection(name).deleteMany({});
    console.log(`[ClearData] Cleared collection "${name}": ${res.deletedCount} document(s).`);
  }

  // 5. Reset restaurantId reference on user accounts while preserving all user credentials & roles
  const userRes = await User.updateMany({}, { $set: { restaurantId: null } });
  const totalUsers = await User.countDocuments();

  console.log(`[ClearData] Reset restaurantId reference on ${userRes.modifiedCount} user account(s).`);
  console.log(`[ClearData] ✅ SUCCESS: Project data cleared! Total preserved user accounts: ${totalUsers}`);

  await mongoose.connection.close();
  console.log('[ClearData] Disconnected from DB.');
  process.exit(0);
}

clearData().catch((err) => {
  console.error('[ClearData] ❌ Error clearing database:', err);
  process.exit(1);
});
