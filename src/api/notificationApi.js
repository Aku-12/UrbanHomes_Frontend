import api from './axios';

const notificationApi = {
  // Get all notifications
  getNotifications: (params = {}) => api.get('/notifications', { params }),

  // Get unread count
  getUnreadCount: () => api.get('/notifications/unread-count'),

  // Mark notification as read
  markAsRead: (notificationId) => api.put(`/notifications/${notificationId}/read`),

  // Mark all as read
  markAllAsRead: () => api.put('/notifications/mark-all-read'),

  // Delete notification
  deleteNotification: (notificationId) => api.delete(`/notifications/${notificationId}`),

  // Delete all read notifications
  deleteAllRead: () => api.delete('/notifications/read/all'),
};

export default notificationApi;
