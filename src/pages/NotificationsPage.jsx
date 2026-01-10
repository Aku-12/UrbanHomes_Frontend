import { useState, useEffect } from 'react';
import { Calendar, CheckCircle, MessageCircle, Eye, CreditCard, Bell, Trash2 } from 'lucide-react';
import { notificationApi } from '../api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useSocket } from '../context';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const navigate = useNavigate();
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Listen for real-time notifications
  useEffect(() => {
    if (socket && isConnected) {
      socket.on('new_notification', (notification) => {
        setNotifications((prev) => [notification, ...prev]);
      });

      return () => {
        socket.off('new_notification');
      };
    }
  }, [socket, isConnected]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await notificationApi.getNotifications({ limit: 50 });
      setNotifications(response.data.notifications);
    } catch (error) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (iconType) => {
    const iconProps = { size: 24 };
    switch (iconType) {
      case 'calendar':
        return <Calendar {...iconProps} className="text-green-600" />;
      case 'check-circle':
        return <CheckCircle {...iconProps} className="text-green-600" />;
      case 'message-circle':
        return <MessageCircle {...iconProps} className="text-purple-600" />;
      case 'eye':
        return <Eye {...iconProps} className="text-green-600" />;
      case 'credit-card':
        return <CreditCard {...iconProps} className="text-green-600" />;
      default:
        return <Bell {...iconProps} className="text-gray-600" />;
    }
  };

  const getIconBgColor = (iconType) => {
    switch (iconType) {
      case 'calendar':
        return 'bg-green-100';
      case 'check-circle':
        return 'bg-green-50';
      case 'message-circle':
        return 'bg-purple-50';
      case 'eye':
        return 'bg-green-50';
      case 'credit-card':
        return 'bg-green-50';
      default:
        return 'bg-gray-100';
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      try {
        await notificationApi.markAsRead(notification._id);
        setNotifications(notifications.map(n =>
          n._id === notification._id ? { ...n, isRead: true } : n
        ));
      } catch (error) {
        console.error('Error marking as read:', error);
      }
    }

    if (notification.link) {
      navigate(notification.link);
    }
  };

  const handleDeleteNotification = async (notificationId, e) => {
    e.stopPropagation();
    try {
      await notificationApi.deleteNotification(notificationId);
      setNotifications(notifications.filter(n => n._id !== notificationId));
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diff = now - notifDate;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'just now';
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'read') return n.isRead;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <button
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
              className="text-sm text-green-600 hover:text-green-700 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              Mark all as read
            </button>
          </div>

          {/* Filters */}
          <div className="flex gap-3">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'unread'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'read'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Read ({notifications.length - unreadCount})
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {loading ? (
            <div className="p-12 text-center text-gray-500">
              Loading notifications...
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Bell size={64} className="mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">No notifications</p>
              <p className="text-sm">
                {filter === 'unread' && 'You have no unread notifications'}
                {filter === 'read' && 'You have no read notifications'}
                {filter === 'all' && 'You have no notifications yet'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification._id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-5 hover:bg-gray-50 cursor-pointer transition-colors group ${
                    !notification.isRead ? 'bg-green-50/30 border-l-4 border-green-600' : ''
                  }`}
                >
                  <div className="flex gap-4">
                    {/* Icon */}
                    <div
                      className={`flex-shrink-0 w-12 h-12 rounded-lg ${getIconBgColor(
                        notification.icon
                      )} flex items-center justify-center`}
                    >
                      {getIcon(notification.icon)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-semibold text-gray-900">
                              {notification.title}
                            </h3>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            {formatTimeAgo(notification.createdAt)}
                          </p>
                        </div>

                        {/* Delete Button */}
                        <button
                          onClick={(e) => handleDeleteNotification(notification._id, e)}
                          className="flex-shrink-0 p-2 text-gray-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
