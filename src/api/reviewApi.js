import api from './axios';

// Create a review for a booking
export const createReview = async (reviewData) => {
  try {
    const response = await api.post('/reviews', reviewData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get reviews for a room
export const getRoomReviews = async (roomId, params = {}) => {
  try {
    const response = await api.get(`/reviews/room/${roomId}`, { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get user's reviews
export const getUserReviews = async () => {
  try {
    const response = await api.get('/reviews/my-reviews');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Check if user can review a booking
export const canReviewBooking = async (bookingId) => {
  try {
    const response = await api.get(`/reviews/can-review/${bookingId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Update a review
export const updateReview = async (reviewId, reviewData) => {
  try {
    const response = await api.put(`/reviews/${reviewId}`, reviewData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Delete a review
export const deleteReview = async (reviewId) => {
  try {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export default {
  createReview,
  getRoomReviews,
  getUserReviews,
  canReviewBooking,
  updateReview,
  deleteReview,
};
