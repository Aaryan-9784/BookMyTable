import mongoose from 'mongoose';
import Wishlist from '../models/Wishlist.js';
import Restaurant from '../models/Restaurant.js';

/**
 * GET /api/wishlist
 * Returns populated wishlisted restaurants for current user
 */
export async function getWishlist(req, res, next) {
  try {
    const items = await Wishlist.find({ userId: req.user._id })
      .populate({
        path: 'restaurantId',
        select: 'name location category priceRange rating imageUrl imageUrls description openingHours tokenFee approvalStatus',
      })
      .sort({ createdAt: -1 });

    // Filter out any deleted or non-approved restaurants
    const restaurants = items
      .map((item) => item.restaurantId)
      .filter((r) => r && r.approvalStatus !== 'rejected' && r.approvalStatus !== 'pending');

    res.json({ ok: true, data: restaurants, count: restaurants.length });
  } catch (e) {
    next(e);
  }
}

/**
 * POST /api/wishlist/toggle/:restaurantId
 * Atomically adds or removes restaurant from user's wishlist
 */
export async function toggleWishlist(req, res, next) {
  try {
    const { restaurantId } = req.params;

    if (!mongoose.isValidObjectId(restaurantId)) {
      return res.status(400).json({ message: 'Invalid restaurant ID' });
    }

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const existing = await Wishlist.findOne({
      userId: req.user._id,
      restaurantId,
    });

    let isWishlisted = false;
    if (existing) {
      await Wishlist.deleteOne({ _id: existing._id });
      isWishlisted = false;
    } else {
      await Wishlist.create({
        userId: req.user._id,
        restaurantId,
      });
      isWishlisted = true;
    }

    const totalSaves = await Wishlist.countDocuments({ restaurantId });

    res.json({
      ok: true,
      isWishlisted,
      totalSaves,
      message: isWishlisted ? 'Saved to Wishlist' : 'Removed from Wishlist',
    });
  } catch (e) {
    next(e);
  }
}

/**
 * GET /api/wishlist/check/:restaurantId
 */
export async function checkWishlistStatus(req, res, next) {
  try {
    const { restaurantId } = req.params;
    if (!mongoose.isValidObjectId(restaurantId)) {
      return res.json({ ok: true, isWishlisted: false });
    }

    const existing = await Wishlist.findOne({
      userId: req.user._id,
      restaurantId,
    });

    res.json({ ok: true, isWishlisted: Boolean(existing) });
  } catch (e) {
    next(e);
  }
}

/**
 * GET /api/wishlist/stats
 * General stats (for partner & admin metrics)
 */
export async function getWishlistStats(req, res, next) {
  try {
    const totalPlatformSaves = await Wishlist.countDocuments();
    let partnerSaves = 0;

    if (req.user && req.user.role === 'restaurant') {
      const owned = await Restaurant.find({ ownerId: req.user._id }).select('_id');
      const ownedIds = owned.map((r) => r._id);
      partnerSaves = await Wishlist.countDocuments({ restaurantId: { $in: ownedIds } });
    }

    res.json({
      ok: true,
      totalPlatformSaves,
      partnerSaves,
    });
  } catch (e) {
    next(e);
  }
}
