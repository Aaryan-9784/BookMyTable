/**
 * Remove all documents from the users collection.
 *
 * Usage: node scripts/clearUsers.js
 */
import '../loadEnv.js';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';

await connectDB();
const db = mongoose.connection.db;

const result = await db.collection('users').deleteMany({});
console.log(`Done. Deleted ${result.deletedCount} user document(s).`);

await mongoose.connection.close();
process.exit(0);
