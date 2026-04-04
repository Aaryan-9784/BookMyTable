/**
 * MongoDB connection via Mongoose — single shared connection for the process.
 */
import mongoose from 'mongoose';

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
