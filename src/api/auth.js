import api from './axios';

export const authApi = {

  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });

    if (response.data.success && response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Google OAuth - Login/Signup
  googleAuth: async (credential) => {
    const response = await api.post('/auth/google', { credential });

    if (response.data.success && response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  getStoredUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  // Forgot Password Flow
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  verifyResetCode: async (email, code) => {
    const response = await api.post('/auth/verify-reset-code', { email, code });
    return response.data;
  },

  resetPassword: async (resetToken, newPassword, confirmPassword) => {
    const response = await api.post('/auth/reset-password', {
      resetToken,
      newPassword,
      confirmPassword,
    });
    return response.data;
  },

  // Change Password Flow (for logged-in users)
  sendChangePasswordCode: async () => {
    const response = await api.post('/auth/send-change-password-code');
    return response.data;
  },

  verifyChangePasswordCode: async (code) => {
    const response = await api.post('/auth/verify-change-password-code', { code });
    return response.data;
  },

  changePasswordWithVerification: async (changeToken, currentPassword, newPassword, confirmPassword) => {
    const response = await api.put('/auth/change-password-verified', {
      changeToken,
      currentPassword,
      newPassword,
      confirmPassword,
    });
    return response.data;
  },

  // Direct change password (without email verification)
  changePassword: async (currentPassword, newPassword, confirmPassword) => {
    const response = await api.put('/auth/change-password', {
      currentPassword,
      newPassword,
      confirmPassword,
    });
    return response.data;
  },
};

export default authApi;
