/**
 * MongoDB connection via Mongoose — single shared connection for the process.
 */
import mongoose from 'mongoose';
import dns from 'node:dns';

// Fix querySrv ECONNREFUSED on local ISP / Windows DNS resolvers by using public Google/Cloudflare DNS
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (err) {
  console.warn('[BookMyTable] Failed to set custom DNS servers:', err.message);
}

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not set in environment');
  }

  mongoose.set('strictQuery', true);

  await mongoose.connect(uri);
  console.log('MongoDB connected');

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
  });
};

export default connectDB;

