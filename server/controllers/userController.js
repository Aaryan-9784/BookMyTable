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
