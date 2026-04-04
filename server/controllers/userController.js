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
 * PATCH /api/users/profile — update fullName (and optionally phone) for the authenticated user.
 */
export async function updateProfile(req, res, next) {
  try {
    const { fullName, phone } = req.body;
    if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
      return res.status(400).json({ message: 'fullName is required' });
    }
    const $set = { fullName: fullName.trim() };
    if (phone && typeof phone === 'string' && phone.trim()) {
      $set.phone = phone.trim();
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
