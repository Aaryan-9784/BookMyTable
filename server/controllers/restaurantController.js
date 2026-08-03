/**
 * Restaurant CRUD — public reads with optional filters; create restricted to admins (legacy route).
 */
import { validationResult, body } from 'express-validator';
import Restaurant from '../models/Restaurant.js';
import Table from '../models/Table.js';
import Booking from '../models/Booking.js';

function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const createRestaurantValidators = [
  body('name').trim().notEmpty().withMessage('name is required'),
  body('location').trim().notEmpty().withMessage('location is required'),
  body('description').optional().isString(),
  body('imageUrl').optional().isString(),
];

/**
 * GET /api/restaurants — list restaurants.
 * Without filter/pagination query params: returns a plain array (backward compatible).
 * With page, limit, location, category, price, rating, sort: returns { items, total, page, limit, totalPages }.
 */
export async function listRestaurants(req, res, next) {
  try {
    const q = req.query || {};
    const hasExtended =
      q.page != null ||
      q.limit != null ||
      q.location ||
      q.q ||
      q.search ||
      q.category ||
      q.minPrice != null ||
      q.maxPrice != null ||
      q.minRating != null ||
      (q.sort && q.sort !== '');

    if (!hasExtended) {
      const items = await Restaurant.find().sort({ createdAt: -1 }).lean();
      return res.json(items);
    }

    const filter = {};
    const searchText = (q.q || q.search || '').trim();
    if (searchText) {
      const rx = new RegExp(escapeRegex(searchText), 'i');
      filter.$or = [{ name: rx }, { location: rx }, { category: rx }];
    }
    if (q.location) {
      filter.location = new RegExp(escapeRegex(q.location), 'i');
    }
    if (q.category) {
      filter.category = new RegExp(escapeRegex(q.category), 'i');
    }
    if (q.minPrice != null || q.maxPrice != null) {
      filter.priceRange = {};
      if (q.minPrice != null) filter.priceRange.$gte = Number(q.minPrice);
      if (q.maxPrice != null) filter.priceRange.$lte = Number(q.maxPrice);
    }
    if (q.minRating != null) {
      filter.rating = { $gte: Number(q.minRating) };
    }

    const page = Math.max(1, parseInt(q.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(q.limit, 10) || 12));
    const skip = (page - 1) * limit;

    let sortOpt = { createdAt: -1 };
    if (q.sort === 'rating') sortOpt = { rating: -1 };
    else if (q.sort === 'price_asc') sortOpt = { priceRange: 1 };
    else if (q.sort === 'price_desc') sortOpt = { priceRange: -1 };
    else if (q.sort === 'newest') sortOpt = { createdAt: -1 };

    const [items, total] = await Promise.all([
      Restaurant.find(filter).sort(sortOpt).skip(skip).limit(limit).lean(),
      Restaurant.countDocuments(filter),
    ]);

    res.json({
      items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (e) {
    next(e);
  }
}

/**
 * GET /api/restaurants/:id — single restaurant by Mongo _id.
 */
export async function getRestaurantById(req, res, next) {
  try {
    const doc = await Restaurant.findById(req.params.id).lean();
    if (!doc) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    const tables = await Table.find({ restaurantId: doc._id }).lean();
    if (tables && tables.length > 0) {
      const calculatedCapacity = tables.reduce((acc, t) => acc + (t.capacity || 0), 0);
      doc.totalSeatingCapacity = calculatedCapacity;
      doc.tables = tables;
      Restaurant.findByIdAndUpdate(doc._id, { totalSeatingCapacity: calculatedCapacity }).exec();
    }
    res.json(doc);
  } catch (e) {
    next(e);
  }
}

/**
 * POST /api/restaurants — admin only; validates body then persists.
 */
export async function createRestaurant(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, location, description = '', imageUrl = '' } = req.body;
    const r = await Restaurant.create({
      name,
      location,
      description,
      imageUrl,
      imageUrls: imageUrl ? [imageUrl] : [],
    });
    res.status(201).json(r);
  } catch (e) {
    next(e);
  }
}

/**
 * GET /api/restaurants/:id/tables — public endpoint to list tables and their slot availability for customers.
 * Query params: date (YYYY-MM-DD), time (HH:MM), guests (Number)
 */
export async function getRestaurantTables(req, res, next) {
  try {
    const { id } = req.params;
    const { date, time, guests } = req.query;

    const tables = await Table.find({ restaurantId: id }).lean();
    if (!tables || tables.length === 0) {
      return res.json({ tables: [], totalAvailableCapacity: 0, availableCount: 0 });
    }

    let reservedTableIds = [];
    if (date && time) {
      const activeBookings = await Booking.find({
        restaurantId: id,
        date,
        time,
        status: { $in: ['confirmed', 'checked-in'] },
      }).lean();
      reservedTableIds = activeBookings
        .map((b) => (b.tableId ? String(b.tableId) : null))
        .filter(Boolean);
    }

    const numGuests = Number(guests) || 1;

    const mappedTables = tables.map((t) => {
      const isReserved = reservedTableIds.includes(String(t._id));
      const fitsGuests = Number(t.capacity) >= numGuests;
      const isAvailable = !isReserved && t.status !== 'Maintenance';
      return {
        ...t,
        isReserved,
        fitsGuests,
        isAvailable,
      };
    });

    const totalAvailableCapacity = mappedTables
      .filter((t) => t.isAvailable)
      .reduce((sum, t) => sum + (Number(t.capacity) || 0), 0);

    res.json({
      tables: mappedTables,
      totalAvailableCapacity,
      availableCount: mappedTables.filter((t) => t.isAvailable).length,
    });
  } catch (e) {
    next(e);
  }
}

/**
 * POST /api/restaurants/:id/reviews — submit guest review & rating for a restaurant.
 */
export async function addRestaurantReview(req, res, next) {
  try {
    const { id } = req.params;
    const { rating, text, author } = req.body;

    const numRating = Number(parseFloat(rating).toFixed(1));
    if (isNaN(numRating) || numRating < 1.0 || numRating > 5.0) {
      return res.status(400).json({ message: 'Rating must be between 1.0 and 5.0' });
    }

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Review content is required' });
    }

    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const reviewAuthor = author?.trim() || req.user?.name || req.user?.email?.split('@')[0] || 'Verified Guest';
    const newReview = {
      author: reviewAuthor,
      rating: numRating,
      text: text.trim(),
      date: 'Just now',
    };

    if (!Array.isArray(restaurant.reviews)) {
      restaurant.reviews = [];
    }

    restaurant.reviews.unshift(newReview);

    // Calculate new average rating
    const totalRating = restaurant.reviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0);
    const avgRating = Number((totalRating / restaurant.reviews.length).toFixed(1));
    restaurant.rating = avgRating;

    await restaurant.save();

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      rating: restaurant.rating,
      reviews: restaurant.reviews,
    });
  } catch (e) {
    next(e);
  }
}
