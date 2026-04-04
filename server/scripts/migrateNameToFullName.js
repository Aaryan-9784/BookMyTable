/**
 * One-time migration: copy `name` → `fullName` for all users that have `name` but no `fullName`.
 * Run: node server/scripts/migrateNameToFullName.js
 */
import '../loadEnv.js';
import mongoose from 'mongoose';
import User from '../models/User.js';

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
if (!MONGO_URI) {
  console.error('❌  MONGO_URI not set in environment');
  process.exit(1);
}

await mongoose.connect(MONGO_URI);
console.log('✅  Connected to MongoDB');

// Find users who have a legacy `name` field but empty/missing `fullName`
const result = await User.updateMany(
  {
    $and: [
      { name: { $exists: true, $ne: '' } },
      { $or: [{ fullName: { $exists: false } }, { fullName: '' }] },
    ],
  },
  [{ $set: { fullName: '$name' } }]
);

console.log(`✅  Migrated ${result.modifiedCount} user(s): name → fullName`);
await mongoose.disconnect();
