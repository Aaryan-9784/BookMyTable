/**
 * /api/admin/* — all routes require Cognito JWT + admin role (MongoDB or ADMIN_EMAILS).
 */
import { Router } from 'express';
import {
  getDashboardStats,
  listRestaurantsAdmin,
  createRestaurantAdmin,
  updateRestaurantAdmin,
  deleteRestaurantAdmin,
  listBookingsAdmin,
  deleteBookingAdmin,
  listUsersAdmin,
  updateUserRole,
  deleteUserAdmin,
  restaurantWriteValidators,
  restaurantUpdateValidators,
  updateRoleValidators,
} from '../controllers/adminController.js';
import { verifyCognitoToken } from '../middleware/verifyCognitoToken.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

router.use(verifyCognitoToken, requireAdmin);

router.get('/dashboard/stats', asyncHandler(getDashboardStats));

router.get('/restaurants', asyncHandler(listRestaurantsAdmin));
router.post('/restaurants', restaurantWriteValidators, asyncHandler(createRestaurantAdmin));
router.put('/restaurants/:id', restaurantUpdateValidators, asyncHandler(updateRestaurantAdmin));
router.delete('/restaurants/:id', asyncHandler(deleteRestaurantAdmin));

router.get('/bookings', asyncHandler(listBookingsAdmin));
router.delete('/bookings/:id', asyncHandler(deleteBookingAdmin));

router.get('/users', asyncHandler(listUsersAdmin));
router.put('/users/:id/role', updateRoleValidators, asyncHandler(updateUserRole));
router.delete('/users/:id', asyncHandler(deleteUserAdmin));

export default router;
