import '../loadEnv.js';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';

async function purgeLegacyFields() {
  try {
    await connectDB();
    console.log('[BookMyTable][Cleanup] Purging cognitoId index and legacy fields from MongoDB Atlas...');

    const collection = mongoose.connection.db.collection('users');

    // 1. Drop legacy cognitoId index if present
    try {
      await collection.dropIndex('cognitoId_1');
      console.log('[BookMyTable][Cleanup] Dropped legacy cognitoId_1 index.');
    } catch (e) {
      console.log('[BookMyTable][Cleanup] cognitoId_1 index check:', e.message);
    }

    // 2. Unset cognitoId and name from all documents
    const result = await collection.updateMany(
      {},
      { $unset: { cognitoId: "", name: "" } }
    );

    console.log(`[BookMyTable][Cleanup] Successfully updated ${result.modifiedCount} user document(s).`);
    process.exit(0);
  } catch (err) {
    console.error('[BookMyTable][Cleanup] Error during database cleanup:', err);
    process.exit(1);
  }
}

purgeLegacyFields();
