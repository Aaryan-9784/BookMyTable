/**
 * Table reservation — linked to User and Restaurant; status for cancel flow.
 */
import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    guests: {
      type: Number,
      required: true,
      min: 1,
      max: 50,
    },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled'],
      default: 'confirmed',
      index: true,
    },
  },
  { timestamps: true }
);

/** Prevent duplicate active bookings for same user / restaurant / slot */
bookingSchema.index(
  { userId: 1, restaurantId: 1, date: 1, time: 1 },
  {
    unique: true,
    partialFilterExpression: { status: 'confirmed' },
  }
);

export default mongoose.model('Booking', bookingSchema);
