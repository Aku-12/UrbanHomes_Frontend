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

  // Initiate eSewa payment
  initiateEsewaPayment: (bookingId) => api.post('/payment/esewa/initiate', { bookingId }),

  // Verify eSewa payment
  verifyEsewaPayment: (data) => api.post('/payment/esewa/verify', { data }),

  // Get payment status
  getPaymentStatus: (bookingId) => api.get(`/payment/status/${bookingId}`),
};

export default bookingApi;
