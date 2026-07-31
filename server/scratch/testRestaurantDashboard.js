import Table from '../models/Table.js';
import Restaurant from '../models/Restaurant.js';
import Booking from '../models/Booking.js';
import {
  getDashboardStats,
  getTables,
  createTable,
  getAnalytics,
} from '../controllers/restaurantDashboardController.js';

console.log('--- Testing Restaurant Dashboard Backend Controller Logic ---');

// Mock req and res
function createMockRes() {
  return {
    statusCode: 200,
    data: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.data = data;
      return this;
    },
  };
}

console.log('✅ Controller functions imported and syntax validated successfully!');
