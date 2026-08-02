/**
 * Restaurant Partner / Vendor Dashboard Controller.
 * Handles table & seating capacity management, booking administration, token fee analysis, and restaurant settings.
 */
import Restaurant from '../models/Restaurant.js';
import Table from '../models/Table.js';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import { pushToUser } from '../utils/sseManager.js';

/**
 * Helper to retrieve active restaurant ID or default to user's assigned restaurant
 */
async function getTargetRestaurant(req) {
  const reqRestaurantId = req.query.restaurantId || req.body.restaurantId;
  if (reqRestaurantId) {
    const found = await Restaurant.findById(reqRestaurantId);
    if (found) return found;
  }

  // 1. Check if authenticated user owns a restaurant
  if (req.user?._id) {
    const owned = await Restaurant.findOne({ ownerId: req.user._id });
    if (owned) return owned;
  }

  // 2. Fallback to first available restaurant or create default partner restaurant
  let target = await Restaurant.findOne().sort({ createdAt: 1 });
  if (!target) {
    target = await Restaurant.create({
      name: 'BookMyTable Partner Restaurant',
      location: 'Downtown Gourmet Hub',
      category: 'Multi-cuisine',
      description: 'Welcome to your restaurant partner console. Configure tables, seating capacity, and bookings here.',
      tokenFee: 150,
      openingHours: '11:00 AM - 11:00 PM',
      rating: 4.8,
      ...(req.user?._id ? { ownerId: req.user._id } : {}),
    });
  } else if (req.user?._id && !target.ownerId) {
    target.ownerId = req.user._id;
    await target.save();
  }

  return target;
}

/**
 * Auto-seed initial tables if none exist for the restaurant
 */
async function ensureDefaultTables(restaurantId, tokenFee = 150) {
  const count = await Table.countDocuments({ restaurantId });
  if (count === 0) {
    const defaultTables = [
      { restaurantId, tableNumber: 'T-01', capacity: 2, zone: 'Main Hall', status: 'Available', tokenFee },
      { restaurantId, tableNumber: 'T-02', capacity: 2, zone: 'Main Hall', status: 'Reserved', tokenFee },
      { restaurantId, tableNumber: 'T-03', capacity: 4, zone: 'Main Hall', status: 'Available', tokenFee },
      { restaurantId, tableNumber: 'T-04', capacity: 4, zone: 'Outdoor Terrace', status: 'Available', tokenFee },
      { restaurantId, tableNumber: 'T-05', capacity: 6, zone: 'Outdoor Terrace', status: 'Available', tokenFee },
      { restaurantId, tableNumber: 'VIP-01', capacity: 8, zone: 'VIP Private Dining', status: 'Reserved', tokenFee: tokenFee * 1.5 },
      { restaurantId, tableNumber: 'VIP-02', capacity: 10, zone: 'VIP Private Dining', status: 'Available', tokenFee: tokenFee * 2 },
      { restaurantId, tableNumber: 'RT-01', capacity: 4, zone: 'Rooftop', status: 'Available', tokenFee },
    ];
    await Table.insertMany(defaultTables);
  }
}

/**
 * GET /api/restaurant-dashboard/stats
 */
export async function getDashboardStats(req, res) {
  const restaurant = await getTargetRestaurant(req);
  if (!restaurant) {
    return res.status(444).json({ ok: false, error: 'No restaurant found in system.' });
  }

  await ensureDefaultTables(restaurant._id, restaurant.tokenFee || 150);

  const tables = await Table.find({ restaurantId: restaurant._id });
  const totalTables = tables.length;
  const totalCapacity = tables.reduce((acc, t) => acc + (t.capacity || 0), 0);

  const bookings = await Booking.find({ restaurantId: restaurant._id })
    .populate('userId', 'name email phone')
    .sort({ createdAt: -1 });

  const activeBookings = bookings.filter((b) => b.status === 'confirmed').length;

  const totalGuestsInBookings = bookings
    .filter((b) => b.status === 'confirmed')
    .reduce((acc, b) => acc + (b.guests || 1), 0);

  const tokenFeeRate = restaurant.tokenFee || 150;
  const totalTokenFees = totalGuestsInBookings * tokenFeeRate;

  const allRestaurants = await Restaurant.find({}, 'name location category rating');

  res.json({
    ok: true,
    restaurant: {
      id: restaurant._id,
      name: restaurant.name,
      location: restaurant.location,
      category: restaurant.category,
      description: restaurant.description,
      imageUrl: restaurant.imageUrl,
      tokenFee: tokenFeeRate,
      openingHours: restaurant.openingHours || '11:00 AM - 11:00 PM',
      approvalStatus: 'approved',
    },
    allRestaurants,
    stats: {
      totalTables,
      totalCapacity,
      activeBookings,
      totalBookings: bookings.length,
      totalTokenFees,
      availableTablesCount: tables.filter((t) => t.status === 'Available').length,
      reservedTablesCount: tables.filter((t) => t.status === 'Reserved').length,
    },
    recentBookings: bookings.slice(0, 8),
  });
}

/**
 * GET /api/restaurant-dashboard/tables
 */
export async function getTables(req, res) {
  const restaurant = await getTargetRestaurant(req);
  if (!restaurant) return res.status(404).json({ ok: false, error: 'Restaurant not found' });

  await ensureDefaultTables(restaurant._id, restaurant.tokenFee || 150);

  const tables = await Table.find({ restaurantId: restaurant._id }).sort({ tableNumber: 1 });
  res.json({ ok: true, tables });
}

/**
 * POST /api/restaurant-dashboard/tables
 */
export async function createTable(req, res) {
  const restaurant = await getTargetRestaurant(req);
  if (!restaurant) return res.status(404).json({ ok: false, error: 'Restaurant not found' });

  const { tableNumber, capacity, zone, status, tokenFee } = req.body;
  if (!tableNumber || !capacity) {
    return res.status(400).json({ ok: false, error: 'Table number and seating capacity are required.' });
  }

  const existing = await Table.findOne({ restaurantId: restaurant._id, tableNumber: tableNumber.trim() });
  if (existing) {
    return res.status(400).json({ ok: false, error: `Table "${tableNumber}" already exists.` });
  }

  const newTable = await Table.create({
    restaurantId: restaurant._id,
    tableNumber: tableNumber.trim(),
    capacity: Number(capacity),
    zone: zone || 'Main Hall',
    status: status || 'Available',
    tokenFee: tokenFee !== undefined ? Number(tokenFee) : restaurant.tokenFee || 150,
  });

  res.status(201).json({ ok: true, table: newTable });
}

/**
 * PUT /api/restaurant-dashboard/tables/:id
 */
export async function updateTable(req, res) {
  const { id } = req.params;
  const { tableNumber, capacity, zone, status, tokenFee } = req.body;

  const table = await Table.findById(id);
  if (!table) return res.status(404).json({ ok: false, error: 'Table not found' });

  if (tableNumber) table.tableNumber = tableNumber.trim();
  if (capacity !== undefined) table.capacity = Number(capacity);
  if (zone) table.zone = zone;
  if (status) table.status = status;
  if (tokenFee !== undefined) table.tokenFee = Number(tokenFee);

  await table.save();
  res.json({ ok: true, table });
}

/**
 * DELETE /api/restaurant-dashboard/tables/:id
 */
export async function deleteTable(req, res) {
  const { id } = req.params;
  const table = await Table.findByIdAndDelete(id);
  if (!table) return res.status(404).json({ ok: false, error: 'Table not found' });

  res.json({ ok: true, message: 'Table deleted successfully.' });
}

/**
 * GET /api/restaurant-dashboard/bookings
 */
export async function getBookings(req, res) {
  const restaurant = await getTargetRestaurant(req);
  if (!restaurant) return res.status(404).json({ ok: false, error: 'Restaurant not found' });

  const bookings = await Booking.find({ restaurantId: restaurant._id })
    .populate('userId', 'name email phone')
    .sort({ createdAt: -1 });

  res.json({ ok: true, bookings });
}

/**
 * PUT /api/restaurant-dashboard/bookings/:id/status
 */
export async function updateBookingStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  if (!['confirmed', 'cancelled', 'completed'].includes(status)) {
    return res.status(400).json({ ok: false, error: 'Invalid booking status' });
  }

  const booking = await Booking.findById(id).populate('restaurantId');
  if (!booking) return res.status(404).json({ ok: false, error: 'Booking not found' });

  booking.status = status;
  await booking.save();

  // Push real-time SSE notification to the customer
  if (booking.userId) {
    const restName = booking.restaurantId?.name || 'Restaurant';
    const statusTitle =
      status === 'confirmed'
        ? 'Reservation Confirmed ✓'
        : status === 'completed'
        ? 'Reservation Completed 🎉'
        : 'Reservation Cancelled ⚠️';
    pushToUser(String(booking.userId), {
      id: Date.now(),
      type: `booking_${status}`,
      title: statusTitle,
      desc: `Your reservation at ${restName} on ${booking.date} at ${booking.time} was updated to "${status.toUpperCase()}".`,
      time: 'Just now',
      unread: true,
    });
  }

  res.json({ ok: true, booking });
}

/**
 * GET /api/restaurant-dashboard/analytics
 */
export async function getAnalytics(req, res) {
  const restaurant = await getTargetRestaurant(req);
  if (!restaurant) return res.status(404).json({ ok: false, error: 'Restaurant not found' });

  const bookings = await Booking.find({ restaurantId: restaurant._id });
  const tables = await Table.find({ restaurantId: restaurant._id });

  const confirmedBookings = bookings.filter((b) => b.status === 'confirmed');
  const cancelledBookings = bookings.filter((b) => b.status === 'cancelled');

  const totalGuests = confirmedBookings.reduce((acc, b) => acc + (b.guests || 1), 0);
  const tokenFeeRate = restaurant.tokenFee || 150;
  
  // Calculate total token fees using table-wise token fee if available
  const totalTokenRevenue = confirmedBookings.reduce((acc, b) => {
    const tableFee = b.tokenFee || tokenFeeRate;
    return acc + (b.guests || 1) * tableFee;
  }, 0);

  const avgTokenFeePerBooking = confirmedBookings.length ? Math.round(totalTokenRevenue / confirmedBookings.length) : 0;
  const avgGuestsPerBooking = confirmedBookings.length ? (totalGuests / confirmedBookings.length).toFixed(1) : '0';

  // Capacity Breakdown (e.g. 2-seater, 4-seater, etc.)
  const capacityBreakdown = tables.reduce((acc, t) => {
    const key = `${t.capacity}-Seater`;
    if (!acc[key]) {
      acc[key] = { count: 0, totalCapacity: 0, avgTokenFee: 0, totalTokenFee: 0 };
    }
    acc[key].count += 1;
    acc[key].totalCapacity += t.capacity;
    acc[key].totalTokenFee += (t.tokenFee || tokenFeeRate);
    return acc;
  }, {});

  // Compute average token fee for each capacity category
  Object.keys(capacityBreakdown).forEach((key) => {
    const item = capacityBreakdown[key];
    item.avgTokenFee = Math.round(item.totalTokenFee / item.count);
  });

  const zoneBreakdown = tables.reduce((acc, t) => {
    acc[t.zone] = (acc[t.zone] || 0) + 1;
    return acc;
  }, {});

  // Table leaderboard (tables with their seating capacity and token fee)
  const tableLeaderboard = tables.map((t) => ({
    id: t._id,
    tableNumber: t.tableNumber,
    capacity: t.capacity,
    zone: t.zone,
    tokenFee: t.tokenFee || tokenFeeRate,
    status: t.status,
  }));

  res.json({
    ok: true,
    analytics: {
      tokenFeeRate,
      totalTokenRevenue,
      totalConfirmedBookings: confirmedBookings.length,
      totalCancelledBookings: cancelledBookings.length,
      totalGuestsServed: totalGuests,
      avgTokenFeePerBooking,
      avgGuestsPerBooking,
      zoneBreakdown,
      capacityBreakdown,
      tableLeaderboard,
      totalTables: tables.length,
      totalSeatingCapacity: tables.reduce((acc, t) => acc + (t.capacity || 0), 0),
    },
  });
}

/**
 * GET /api/restaurant-dashboard/settings
 */
export async function getSettings(req, res) {
  const restaurant = await getTargetRestaurant(req);
  if (!restaurant) return res.status(404).json({ ok: false, error: 'Restaurant not found' });

  res.json({ ok: true, restaurant });
}

/**
 * PUT /api/restaurant-dashboard/settings
 */
export async function updateSettings(req, res) {
  const restaurant = await getTargetRestaurant(req);
  if (!restaurant) return res.status(404).json({ ok: false, error: 'Restaurant not found' });

  const {
    name,
    location,
    category,
    description,
    tokenFee,
    totalSeatingCapacity,
    openingHours,
    priceRange,
    experiences,
    imageUrl,
    imageUrls,
  } = req.body;

  if (name) restaurant.name = name.trim();
  if (location) restaurant.location = location.trim();
  if (category) restaurant.category = category.trim();
  if (description !== undefined) restaurant.description = description.trim();
  if (tokenFee !== undefined) restaurant.tokenFee = Number(tokenFee);
  if (totalSeatingCapacity !== undefined) restaurant.totalSeatingCapacity = Number(totalSeatingCapacity);
  if (openingHours) restaurant.openingHours = openingHours.trim();
  if (priceRange) restaurant.priceRange = Number(priceRange);
  if (Array.isArray(experiences)) restaurant.experiences = experiences;
  if (imageUrl !== undefined) restaurant.imageUrl = imageUrl;
  if (Array.isArray(imageUrls)) restaurant.imageUrls = imageUrls;

  await restaurant.save();

  res.json({ ok: true, restaurant });
}
