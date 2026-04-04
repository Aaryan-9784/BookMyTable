/**
 * Remove all documents from every collection except users and restaurants.
 * System collections are skipped.
 *
 * Usage: node scripts/clearDatabaseExceptUsersRestaurants.js
 */
import '../loadEnv.js';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';

const PRESERVE = new Set(['users', 'restaurants']);

await connectDB();
const db = mongoose.connection.db;

const collections = await db.listCollections().toArray();
const names = collections.map((c) => c.name).filter((n) => !n.startsWith('system.'));
console.log(`Collections found: ${names.length ? names.join(', ') : '(none)'}`);
let deletedTotal = 0;

for (const { name } of collections) {
  if (name.startsWith('system.')) continue;
  if (PRESERVE.has(name)) {
    console.log(`Preserved: ${name}`);
    continue;
  }
  const result = await db.collection(name).deleteMany({});
  deletedTotal += result.deletedCount;
  console.log(`Cleared "${name}": ${result.deletedCount} document(s)`);
}

console.log(`Done. Total documents removed: ${deletedTotal} (users + restaurants unchanged).`);
await mongoose.connection.close();
process.exit(0);
