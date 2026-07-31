/**
 * Database Cleanup Script — Strips authId, cognitoId, fullName, __v from MongoDB Atlas.
 * Leaves ONLY clean fields: _id, email, password, name, phone, role, createdAt, updatedAt.
 */
import '../loadEnv.js';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';

async function cleanUserDatabase() {
  try {
    await connectDB();
    console.log('[BookMyTable][Cleanup] Cleaning MongoDB Atlas User documents...');

    const collection = mongoose.connection.db.collection('users');

    // 1. Drop any legacy indexes
    try { await collection.dropIndex('authId_1'); } catch {}
    try { await collection.dropIndex('cognitoId_1'); } catch {}

    // 2. Unset all unnecessary/redundant fields
    const result = await collection.updateMany(
      {},
      {
        $unset: {
          authId: "",
          cognitoId: "",
          fullName: "",
          __v: ""
        }
      }
    );

    console.log(`[BookMyTable][Cleanup] Cleaned ${result.modifiedCount} user document(s).`);
    process.exit(0);
  } catch (err) {
    console.error('[BookMyTable][Cleanup] Error during database cleanup:', err);
    process.exit(1);
  }
}

cleanUserDatabase();
