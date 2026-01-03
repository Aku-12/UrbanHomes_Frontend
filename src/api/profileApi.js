import api from './axios';

export const getUserProfile = async () => {
  try {
    const response = await api.get('/profile/me');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateUserProfile = async (profileData) => {
  try {
    const response = await api.put('/profile/me', profileData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getUserBookings = async (page = 1, limit = 10) => {
  try {
    const response = await api.get(`/profile/bookings?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const uploadProfilePicture = async (file) => {
  try {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await api.post('/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export default {
  getUserProfile,
  updateUserProfile,
  getUserBookings,
  uploadProfilePicture
};
