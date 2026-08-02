/**
 * Table Schema — Seating capacity, table number, zone/type, and availability status.
 */
import mongoose from 'mongoose';

const tableSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
      index: true,
    },
    tableNumber: {
      type: String,
      required: true,
      trim: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
      max: 30,
      default: 4,
    },
    zone: {
      type: String,
      enum: [
        'Fine Dining',
        'Outdoor Terrace',
        'Rooftop Dining',
        'VIP Dining',
        'Bar & Lounge',
        'Gourmet Cuisine',
        'Private Dining',
        'Live Music',
        'Main Hall',
        'VIP Private Dining',
        'Rooftop',
        'Bar Counter',
      ],
      default: 'Fine Dining',
    },
    status: {
      type: String,
      enum: ['Available', 'Reserved', 'Maintenance'],
      default: 'Available',
    },
    tokenFee: {
      type: Number,
      default: 150,
      min: 0,
    },
  },
  { timestamps: true }
);

tableSchema.index({ restaurantId: 1, tableNumber: 1 }, { unique: true });

export default mongoose.model('Table', tableSchema);
