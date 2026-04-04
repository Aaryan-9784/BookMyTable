/**
 * One-off: delete bookings matching the My Bookings screenshot (restaurant + date + time + guests).
 * Usage: node scripts/removeBookingsByScreenshotSpec.js
 */
import '../loadEnv.js';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Booking from '../models/Booking.js';
import Restaurant from '../models/Restaurant.js';

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Same rows as UI: Mar 28/30 2026 */
const SPECS = [
  { name: 'Spice Villa', date: '2026-03-28', time: '17:30', guests: 3 },
  { name: 'Sabarmati Flavors', date: '2026-03-28', time: '19:00', guests: 3 },
  { name: 'Marina Bay Dine', date: '2026-03-30', time: '19:00', guests: 13 },
  { name: 'Spice Villa', date: '2026-03-30', time: '19:00', guests: 22 },
];

await connectDB();

let total = 0;
for (const s of SPECS) {
  const restaurant = await Restaurant.findOne({
    name: new RegExp(`^${escapeRegex(s.name)}$`, 'i'),
  })
    .select('_id name')
    .lean();

  if (!restaurant) {
    console.warn(`Skip (no restaurant): ${s.name}`);
    continue;
  }

  const timeVariants = [s.time, `${s.time}:00`];
  const res = await Booking.deleteMany({
    restaurantId: restaurant._id,
    date: s.date,
    time: { $in: timeVariants },
    guests: s.guests,
  });

  console.log(
    `Deleted ${res.deletedCount} booking(s): ${restaurant.name} | ${s.date} ${s.time} | ${s.guests} guests`
  );
  total += res.deletedCount;
}

console.log(`Done. Total bookings removed: ${total}`);
await mongoose.connection.close();
process.exit(0);
