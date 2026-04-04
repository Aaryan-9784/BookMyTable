/**
 * Admin API — same axios instance + JWT; /api/admin/* routes.
 */
import api from '../../services/api.js';

const base = '/api/admin';

export const adminApi = {
  getStats: () => api.get(`${base}/dashboard/stats`),
  listRestaurants: (params) => api.get(`${base}/restaurants`, { params }),
  createRestaurant: (body) => api.post(`${base}/restaurants`, body),
  updateRestaurant: (id, body) => api.put(`${base}/restaurants/${id}`, body),
  deleteRestaurant: (id) => api.delete(`${base}/restaurants/${id}`),
  /** Multipart upload — field name `image`; requires admin JWT. */
  uploadImage: (file) => {
    const fd = new FormData();
    fd.append('image', file);
    return api.post('/api/upload', fd);
  },
  listBookings: (params) => api.get(`${base}/bookings`, { params }),
  deleteBooking: (id) => api.delete(`${base}/bookings/${id}`),
  listUsers: (params) => api.get(`${base}/users`, { params }),
  updateUserRole: (id, role) => api.put(`${base}/users/${id}/role`, { role }),
};
