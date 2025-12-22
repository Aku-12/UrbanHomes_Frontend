import api from './axios';

const bookingApi = {
  // Create a new booking
  createBooking: (bookingData) => api.post('/bookings', bookingData),

  // Get user's bookings
  getMyBookings: () => api.get('/bookings/my'),

  // Cancel a booking
  cancelBooking: (bookingId) => api.delete(`/bookings/${bookingId}`),

  // Validate promo code
  validatePromoCode: (code) => api.post('/bookings/validate-promo', { code }),
};

export default bookingApi;
