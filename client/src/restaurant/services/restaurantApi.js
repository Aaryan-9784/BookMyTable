import api from '../../services/api.js';

const base = '/restaurant-dashboard';

export const restaurantApi = {
  getStats: (restaurantId) => api.get(`${base}/stats`, { params: { restaurantId } }),
  
  getTables: (restaurantId) => api.get(`${base}/tables`, { params: { restaurantId } }),
  createTable: (data) => api.post(`${base}/tables`, data),
  updateTable: (id, data) => api.put(`${base}/tables/${id}`, data),
  deleteTable: (id) => api.delete(`${base}/tables/${id}`),

  getBookings: (restaurantId) => api.get(`${base}/bookings`, { params: { restaurantId } }),
  updateBookingStatus: (id, status) => api.put(`${base}/bookings/${id}/status`, { status }),

  getAnalytics: (restaurantId) => api.get(`${base}/analytics`, { params: { restaurantId } }),

  getSettings: (restaurantId) => api.get(`${base}/settings`, { params: { restaurantId } }),
  updateSettings: (data) => api.put(`${base}/settings`, data),
};
