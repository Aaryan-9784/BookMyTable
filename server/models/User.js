/**
 * Application user synced from Cognito — stores cognitoId + email for bookings and admin checks.
 */
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    cognitoId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    name: {
      // Legacy field — kept so Mongoose doesn't strip it; migrated to fullName on read
      type: String,
      default: '',
      trim: true,
    },
    fullName: {
      type: String,
      default: '',
      trim: true,
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
