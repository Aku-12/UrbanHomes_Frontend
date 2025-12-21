import api from './axios';

const adminApi = {
  // Dashboard
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
  getRecentBookings: (limit = 5) => api.get(`/admin/dashboard/recent-bookings?limit=${limit}`),

  // Global Search
  search: (query) => api.get(`/admin/search?q=${encodeURIComponent(query)}`),

  // Room Management
  getAllRooms: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/admin/rooms${queryString ? `?${queryString}` : ''}`);
  },
  toggleRoomStatus: (roomId) => api.patch(`/admin/rooms/${roomId}/toggle-status`),
  deleteRoom: (roomId) => api.delete(`/admin/rooms/${roomId}`),

  // User Management
  getAllUsers: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/admin/users${queryString ? `?${queryString}` : ''}`);
  },
  getUserById: (userId) => api.get(`/admin/users/${userId}`),
  blockUser: (userId) => api.patch(`/admin/users/${userId}/block`),
  unblockUser: (userId) => api.patch(`/admin/users/${userId}/unblock`),

  // Booking Management
  getAllBookings: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/admin/bookings${queryString ? `?${queryString}` : ''}`);
  },
  getBookingById: (bookingId) => api.get(`/admin/bookings/${bookingId}`),
  approveBooking: (bookingId) => api.patch(`/admin/bookings/${bookingId}/approve`),
  rejectBooking: (bookingId) => api.patch(`/admin/bookings/${bookingId}/reject`),
};

export default adminApi;
