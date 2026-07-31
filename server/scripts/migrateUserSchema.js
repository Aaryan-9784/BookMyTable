/**
 * Database Migration Script: Upgrades User schema in MongoDB Atlas.
 * Populates authId = cognitoId on existing user documents.
 */
import '../loadEnv.js';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';

async function runMigration() {
  try {
    await connectDB();
    console.log('[BookMyTable][Migration] Starting User Schema Migration...');

    const users = await User.find({});
    console.log(`[BookMyTable][Migration] Found ${users.length} total user records.`);

    let updatedCount = 0;
    for (const u of users) {
      let modified = false;

      if (!u.authId && u.cognitoId) {
        u.authId = u.cognitoId;
        modified = true;
      } else if (!u.cognitoId && u.authId) {
        u.cognitoId = u.authId;
        modified = true;
      }

      if (modified) {
        await u.save();
        updatedCount++;
      }
    }

    console.log(`[BookMyTable][Migration] Successfully migrated ${updatedCount} user documents to current schema.`);
    process.exit(0);
  } catch (err) {
    console.error('[BookMyTable][Migration] Error during migration:', err);
    process.exit(1);
  }
}

runMigration();
