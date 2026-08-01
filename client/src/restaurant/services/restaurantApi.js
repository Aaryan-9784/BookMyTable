import api from '../../services/api.js';

const base = '/api/restaurant-dashboard';

// In-memory cache for fast fallback
const cache = new Map();

export const restaurantApi = {
  getCache: (key) => cache.get(key),
  setCache: (key, data) => cache.set(key, data),
  clearCache: () => cache.clear(),

  getStats: async (restaurantId) => {
    const key = `stats_${restaurantId || 'default'}`;
    const res = await api.get(`${base}/stats`, { params: { restaurantId } });
    cache.set(key, res);
    return res;
  },

  getTables: async (restaurantId) => {
    const key = `tables_${restaurantId || 'default'}`;
    const res = await api.get(`${base}/tables`, { params: { restaurantId } });
    cache.set(key, res);
    return res;
  },

  createTable: async (data) => {
    cache.clear();
    return api.post(`${base}/tables`, data);
  },

  updateTable: async (id, data) => {
    cache.clear();
    return api.put(`${base}/tables/${id}`, data);
  },

  deleteTable: async (id) => {
    cache.clear();
    return api.delete(`${base}/tables/${id}`);
  },

  getBookings: async (restaurantId) => {
    const key = `bookings_${restaurantId || 'default'}`;
    const res = await api.get(`${base}/bookings`, { params: { restaurantId } });
    cache.set(key, res);
    return res;
  },

  updateBookingStatus: async (id, status) => {
    cache.clear();
    return api.put(`${base}/bookings/${id}/status`, { status });
  },

  getAnalytics: async (restaurantId) => {
    const key = `analytics_${restaurantId || 'default'}`;
    const res = await api.get(`${base}/analytics`, { params: { restaurantId } });
    cache.set(key, res);
    return res;
  },

  getSettings: async (restaurantId) => {
    const key = `settings_${restaurantId || 'default'}`;
    const res = await api.get(`${base}/settings`, { params: { restaurantId } });
    cache.set(key, res);
    return res;
  },

  updateSettings: async (data) => {
    cache.clear();
    return api.put(`${base}/settings`, data);
  },
};
