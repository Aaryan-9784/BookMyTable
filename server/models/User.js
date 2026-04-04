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
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
