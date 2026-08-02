/**
 * Admin module — CRUD restaurants, manage bookings & users (RBAC via requireAdmin).
 */
import mongoose from 'mongoose';
import { validationResult, body, param, query } from 'express-validator';
import Restaurant from '../models/Restaurant.js';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import { pushToUser } from '../utils/sseManager.js';

export const restaurantWriteValidators = [
  body('name').trim().notEmpty(),
  body('location').trim().notEmpty(),
  body('description').optional().isString(),
  body('imageUrl').optional().isString(),
  body('imageUrls').optional().isArray(),
  body('category').optional().isString(),
  body('priceRange').optional().isInt({ min: 1, max: 4 }),
  body('rating').optional().isFloat({ min: 0, max: 5 }),
];

export const restaurantUpdateValidators = [
  body('name').optional().trim().notEmpty(),
  body('location').optional().trim().notEmpty(),
  body('description').optional().isString(),
  body('imageUrl').optional().isString(),
  body('imageUrls').optional().isArray(),
  body('category').optional().isString(),
  body('priceRange').optional().isInt({ min: 1, max: 4 }),
  body('rating').optional().isFloat({ min: 0, max: 5 }),
];

/**
 * GET /api/admin/dashboard/stats
 */
export async function getDashboardStats(_req, res, next) {
  try {
    const [users, bookings, totalRestaurants, recentBookings] = await Promise.all([
      User.countDocuments(),
      Booking.countDocuments({ status: 'confirmed' }),
      Restaurant.countDocuments(),
      Booking.find()
        .sort({ createdAt: -1 })
        .limit(8)
        .populate('userId', 'email name fullName')
        .populate('restaurantId', 'name location')
        .lean(),
    ]);

    // Calculate total token fees collected across all confirmed bookings
    const confirmedBookings = await Booking.find({ status: 'confirmed' }).populate('restaurantId', 'tokenFee');
    const totalTokenFees = confirmedBookings.reduce((sum, b) => {
      const fee = b.restaurantId?.tokenFee || 150;
      return sum + (b.guests || 1) * fee;
    }, 0);

    res.json({
      totalUsers: users,
      totalBookings: bookings,
      totalRestaurants,
      pendingCount: 0,
      approvedCount: totalRestaurants,
      rejectedCount: 0,
      totalTokenFees,
      recentBookings,
    });
  } catch (e) {
    next(e);
  }
}

/**
 * GET /api/admin/restaurants — list with optional search
 */
export async function listRestaurantsAdmin(req, res, next) {
  try {
    const q = (req.query.q || '').trim();
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const filter = {};
    if (q) {
      filter.$or = [
        { name: new RegExp(escaped, 'i') },
        { location: new RegExp(escaped, 'i') },
        { category: new RegExp(escaped, 'i') },
      ];
    }

    const items = await Restaurant.find(filter)
      .populate('ownerId', 'name email phone')
      .sort({ createdAt: -1 })
      .lean();

    res.json(items);
  } catch (e) {
    next(e);
  }
}

/**
 * PUT /api/admin/restaurants/:id/approve
 */
export async function approveRestaurantAdmin(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid restaurant ID' });
    }
    const doc = await Restaurant.findByIdAndUpdate(
      req.params.id,
      { $set: { approvalStatus: 'approved', rejectionReason: '' } },
      { new: true }
    );
    if (!doc) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    if (doc.ownerId) {
      pushToUser(String(doc.ownerId), {
        id: Date.now(),
        type: 'restaurant_approved',
        title: 'Restaurant Approved 🎉',
        desc: `Congratulations! Your venue "${doc.name}" has been approved by the platform admin and is now live.`,
        time: 'Just now',
        unread: true,
      });
    }

    res.json({ ok: true, message: 'Restaurant approved successfully', restaurant: doc });
  } catch (e) {
    next(e);
  }
}

/**
 * PUT /api/admin/restaurants/:id/reject
 */
export async function rejectRestaurantAdmin(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid restaurant ID' });
    }
    const { reason = 'Did not meet submission criteria.' } = req.body;
    const doc = await Restaurant.findByIdAndUpdate(
      req.params.id,
      { $set: { approvalStatus: 'rejected', rejectionReason: reason } },
      { new: true }
    );
    if (!doc) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    if (doc.ownerId) {
      pushToUser(String(doc.ownerId), {
        id: Date.now(),
        type: 'restaurant_rejected',
        title: 'Submission Update ⚠️',
        desc: `Your venue listing for "${doc.name}" was not approved. Reason: ${reason}`,
        time: 'Just now',
        unread: true,
      });
    }

    res.json({ ok: true, message: 'Restaurant rejected', restaurant: doc });
  } catch (e) {
    next(e);
  }
}


/**
 * POST /api/admin/restaurants
 */
export async function createRestaurantAdmin(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      name,
      location,
      description = '',
      imageUrl = '',
      imageUrls = [],
      category = 'Multi-cuisine',
      priceRange = 2,
      rating = 4.2,
      reviews = [],
      tokenFee = 150,
      totalSeatingCapacity = 40,
      openingHours = '11:00 AM - 11:00 PM',
      ownerId = null,
      ownerEmail = null,
      ownerName = null,
      experiences = ['Fine Dining', 'Outdoor Terrace'],
    } = req.body;

    let finalOwnerId = ownerId || null;
    if (!finalOwnerId && ownerEmail && typeof ownerEmail === 'string' && ownerEmail.trim()) {
      const emailNorm = ownerEmail.trim().toLowerCase();
      let partnerUser = await User.findOne({ email: emailNorm });
      if (!partnerUser) {
        partnerUser = await User.create({
          fullName: ownerName || emailNorm.split('@')[0],
          email: emailNorm,
          password: 'Partner@' + Math.random().toString(36).slice(-6),
          role: 'restaurant',
          isEmailVerified: true,
        });
      } else if (partnerUser.role !== 'restaurant' && partnerUser.role !== 'admin') {
        partnerUser.role = 'restaurant';
        await partnerUser.save();
      }
      finalOwnerId = partnerUser._id;
    }

    const urls = Array.isArray(imageUrls) && imageUrls.length ? imageUrls : imageUrl ? [imageUrl] : [];
    const r = await Restaurant.create({
      name,
      location,
      description,
      imageUrl: imageUrl || urls[0] || '',
      imageUrls: urls.length ? urls : imageUrl ? [imageUrl] : [],
      category,
      priceRange,
      rating,
      reviews,
      tokenFee: Number(tokenFee) || 150,
      totalSeatingCapacity: Number(totalSeatingCapacity) || 40,
      openingHours: openingHours || '11:00 AM - 11:00 PM',
      ownerId: finalOwnerId,
      experiences: Array.isArray(experiences) ? experiences : ['Fine Dining', 'Outdoor Terrace'],
    });
    res.status(201).json(r);
  } catch (e) {
    next(e);
  }
}

/**
 * PUT /api/admin/restaurants/:id
 */
export async function updateRestaurantAdmin(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    if (Object.keys(req.body || {}).length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid id' });
    }

    const allowed = [
      'name',
      'location',
      'description',
      'imageUrl',
      'imageUrls',
      'category',
      'priceRange',
      'rating',
      'reviews',
      'tokenFee',
      'totalSeatingCapacity',
      'openingHours',
      'ownerId',
      'experiences',
    ];
    const patch = {};
    for (const k of allowed) {
      if (req.body[k] !== undefined) patch[k] = req.body[k];
    }

    const doc = await Restaurant.findByIdAndUpdate(req.params.id, { $set: patch }, { new: true });
    if (!doc) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    res.json(doc);
  } catch (e) {
    next(e);
  }
}

/**
 * DELETE /api/admin/restaurants/:id
 */
export async function deleteRestaurantAdmin(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid id' });
    }
    await Booking.deleteMany({ restaurantId: req.params.id });
    const r = await Restaurant.findByIdAndDelete(req.params.id);
    if (!r) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    res.json({ message: 'Restaurant deleted', id: req.params.id });
  } catch (e) {
    next(e);
  }
}

/**
 * GET /api/admin/bookings
 */
export async function listBookingsAdmin(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Booking.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'email fullName role')
        .populate('restaurantId', 'name location')
        .lean(),
      Booking.countDocuments(),
    ]);

    res.json({ items, page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (e) {
    next(e);
  }
}

/**
 * DELETE /api/admin/bookings/:id
 */
export async function deleteBookingAdmin(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid id' });
    }
    const b = await Booking.findByIdAndDelete(req.params.id);
    if (!b) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json({ message: 'Booking deleted', id: req.params.id });
  } catch (e) {
    next(e);
  }
}

export const updateRoleValidators = [
  param('id').isMongoId(),
  body('role').isIn(['user', 'customer', 'restaurant', 'admin']),
];

/**
 * GET /api/admin/users
 */
export async function listUsersAdmin(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 30));
    const skip = (page - 1) * limit;
    const q = (req.query.q || '').trim();

    const filter = q
      ? {
          $or: [
            { email: new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
            { fullName: new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
          ],
        }
      : {};

    const [items, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).select('-__v').lean(),
      User.countDocuments(filter),
    ]);

    res.json({ items, page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (e) {
    next(e);
  }
}

/**
 * DELETE /api/admin/users/:id
 */
export async function deleteUserAdmin(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid id' });
    }
    // Prevent deleting yourself
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Also remove all bookings belonging to this user
    await Booking.deleteMany({ userId: req.params.id });
    res.json({ message: 'User deleted', id: req.params.id });
  } catch (e) {
    next(e);
  }
}

/**
 * PUT /api/admin/users/:id/role
 */
export async function updateUserRole(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid id' });
    }

    const { role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { $set: { role } }, { new: true }).select(
      '-__v'
    );
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (e) {
    next(e);
  }
}
