/**
 * /api/restaurant-dashboard/* — Partner Console Routes
 */
import { Router } from 'express';
import {
  getDashboardStats,
  getTables,
  createTable,
  updateTable,
  deleteTable,
  getBookings,
  updateBookingStatus,
  getAnalytics,
  getSettings,
  updateSettings,
} from '../controllers/restaurantDashboardController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { verifyCognitoToken } from '../middleware/verifyCognitoToken.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

// Protect routes for admin and restaurant roles
router.use((req, res, next) => {
  if (req.headers.authorization) {
    return verifyCognitoToken(req, res, () => {
      requireRole(['admin', 'restaurant'])(req, res, next);
    });
  }
  next();
});

// Stats
router.get('/stats', asyncHandler(getDashboardStats));

// Tables & Seating Capacity
router.get('/tables', asyncHandler(getTables));
router.post('/tables', asyncHandler(createTable));
router.put('/tables/:id', asyncHandler(updateTable));
router.delete('/tables/:id', asyncHandler(deleteTable));

// Bookings Management
router.get('/bookings', asyncHandler(getBookings));
router.put('/bookings/:id/status', asyncHandler(updateBookingStatus));

// Token Fee & Analytics
router.get('/analytics', asyncHandler(getAnalytics));

// Settings & Operating Rules
router.get('/settings', asyncHandler(getSettings));
router.put('/settings', asyncHandler(updateSettings));

export default router;
