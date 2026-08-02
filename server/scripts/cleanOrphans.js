import dns from 'node:dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

await mongoose.connect(process.env.MONGODB_URI, { family: 4 });
const db = mongoose.connection.db;

const activeRestaurants = await db.collection('restaurants').find({}).toArray();
const validIds = activeRestaurants.map(r => r._id);
console.log('Valid restaurant IDs:', validIds.map(id => id.toString()));

const res = await db.collection('tables').deleteMany({
  restaurantId: { $nin: validIds }
});
console.log('Deleted orphan tables count:', res.deletedCount);

const remainingTables = await db.collection('tables').find({}).toArray();
console.log('Remaining tables count:', remainingTables.length);

await mongoose.disconnect();
