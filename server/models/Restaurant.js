/**
 * Restaurant listing — S3 image URLs; extended fields for filters / gallery (Zomato-style UX).
 */
import mongoose from 'mongoose';

const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    imageUrl: {
      type: String,
      default: '',
      trim: true,
    },
    /** Extra gallery images (S3 URLs); first slot often mirrors imageUrl for older clients */
    imageUrls: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      default: 'Multi-cuisine',
      trim: true,
    },
    /** 1 = ₹, 2 = ₹₹, 3 = ₹₹₹, 4 = ₹₹₹₹ */
    priceRange: {
      type: Number,
      min: 1,
      max: 4,
      default: 2,
    },
    /** Average rating 0–5 (can be updated from reviews later) */
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 4.2,
    },
    /** Mock reviews for product UI until a Review collection exists */
    reviews: {
      type: [
        {
          author: String,
          text: String,
          rating: { type: Number, min: 1, max: 5 },
          date: { type: String, default: '' },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

restaurantSchema.index({ location: 'text', name: 'text', category: 'text' });
restaurantSchema.index({ category: 1, priceRange: 1, rating: -1 });

export default mongoose.model('Restaurant', restaurantSchema);
