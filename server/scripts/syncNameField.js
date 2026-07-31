import '../loadEnv.js';
import connectDB from '../config/db.js';
import User from '../models/User.js';

async function syncNameField() {
  try {
    await connectDB();
    console.log('[BookMyTable][Sync] Populating name field in MongoDB Atlas...');

    const users = await User.find({});
    let updatedCount = 0;

    for (const u of users) {
      const displayName = u.fullName || u.name || u.email.split('@')[0];
      u.name = displayName;
      u.fullName = displayName;
      await u.save();
      updatedCount++;
    }

    console.log(`[BookMyTable][Sync] Successfully updated ${updatedCount} user document(s).`);
    process.exit(0);
  } catch (err) {
    console.error('[BookMyTable][Sync] Error:', err);
    process.exit(1);
  }
}

syncNameField();
