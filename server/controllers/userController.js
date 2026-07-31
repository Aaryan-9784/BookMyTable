/**
 * Authenticated user profile — MongoDB role + email (Cognito is source of auth).
 */
import User from '../models/User.js';
import Booking from '../models/Booking.js';

/**
 * GET /api/users/profile — requires Cognito JWT (via route middleware).
 */
export async function getProfile(req, res, next) {
  try {
    const user = await User.findById(req.user._id).select('-__v').lean();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const bookingCount = await Booking.countDocuments({ userId: req.user._id });
    const upcoming = await Booking.countDocuments({
      userId: req.user._id,
      status: 'confirmed',
      date: { $gte: new Date().toISOString().slice(0, 10) },
    });

    res.json({
      ...user,
      stats: { totalBookings: bookingCount, upcomingConfirmed: upcoming },
    });
  } catch (e) {
    next(e);
  }
}

/**
 * PATCH /api/users/profile — update fullName and/or phone for the authenticated user.
 * Both fields are optional; at least one must be provided.
 */
export async function updateProfile(req, res, next) {
  try {
    const { name, fullName, phone } = req.body;

    const $set = {};
    const newName = name || fullName;
    if (newName !== undefined) {
      if (typeof newName !== 'string' || !newName.trim()) {
        return res.status(400).json({ message: 'Name must be a non-empty string' });
      }
      $set.name = newName.trim();
    }
    if (phone !== undefined && phone !== null) {
      if (typeof phone === 'string' && phone.trim()) {
        $set.phone = phone.trim();
      }
    }

    if (Object.keys($set).length === 0) {
      return res.status(400).json({ message: 'Provide at least name or phone to update' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set },
      { new: true }
    ).select('-__v').lean();
    res.json(user);
  } catch (e) {
    next(e);
  }
}
