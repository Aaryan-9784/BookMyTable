/**
 * /api/restaurants — public GETs; POST protected (admin).
 */
import { Router } from 'express';
import {
  listRestaurants,
  getRestaurantById,
  createRestaurant,
  createRestaurantValidators,
} from '../controllers/restaurantController.js';
import { verifyCognitoToken } from '../middleware/verifyCognitoToken.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

router.get('/', asyncHandler(listRestaurants));
router.get('/:id', asyncHandler(getRestaurantById));
router.post(
  '/',
  verifyCognitoToken,
  requireAdmin,
  createRestaurantValidators,
  asyncHandler(createRestaurant)
);

export default router;
