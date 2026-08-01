import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from server root
dotenv.config({ path: join(__dirname, '..', '.env') });

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('MONGODB_URI not set');
  process.exit(1);
}

try {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const result = await mongoose.connection.db
    .collection('restaurants')
    .updateMany({ tokenFee: 150 }, { $set: { tokenFee: 100 } });

  console.log(`Updated ${result.modifiedCount} restaurant(s): tokenFee 150 -> 100`);
} catch (err) {
  console.error('Error:', err.message);
} finally {
  await mongoose.disconnect();
  console.log('Disconnected');
}
