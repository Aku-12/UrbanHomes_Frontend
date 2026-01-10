import { useState, useEffect, useRef } from 'react';
import { Calendar, CheckCircle, MessageCircle, Eye, CreditCard, Bell, X } from 'lucide-react';
import { notificationApi } from '../../api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const NotificationDropdown = ({ isOpen, onClose, unreadCount, onUnreadCountChange }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Icon mapping based on notification type
  const getIcon = (iconType) => {
    const iconProps = { size: 20 };
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

  // Icon background color mapping
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

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await notificationApi.getNotifications({ limit: 10 });
      setNotifications(response.data.notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      onUnreadCountChange(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleNotificationClick = async (notification) => {
    // Mark as read if unread
    if (!notification.isRead) {
      try {
        await notificationApi.markAsRead(notification._id);
        setNotifications(notifications.map(n =>
          n._id === notification._id ? { ...n, isRead: true } : n
        ));
        onUnreadCountChange(Math.max(0, unreadCount - 1));
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }

    // Navigate if link exists
    if (notification.link) {
      navigate(notification.link);
      onClose();
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

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-lg border border-blue-200 z-50 max-h-[600px] flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
        <button
          onClick={handleMarkAllAsRead}
          className="text-sm text-green-600 hover:text-green-700 font-medium"
          disabled={unreadCount === 0}
        >
          Mark all as read
        </button>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Bell size={48} className="mx-auto mb-3 text-gray-300" />
            <p>No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                  !notification.isRead ? 'bg-blue-50/30' : ''
                }`}
              >
                <div className="flex gap-3">
                  {/* Icon */}
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-lg ${getIconBgColor(
                      notification.icon
                    )} flex items-center justify-center`}
                  >
                    {getIcon(notification.icon)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-semibold text-gray-900">
                        {notification.title}
                      </h4>
                      {!notification.isRead && (
                        <div className="flex-shrink-0 w-2 h-2 bg-green-600 rounded-full mt-1"></div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatTimeAgo(notification.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer - View All (Optional) */}
      {notifications.length > 0 && (
        <div className="border-t border-gray-200 p-2">
          <button
            onClick={() => {
              navigate('/notifications');
              onClose();
            }}
            className="w-full py-2 text-sm text-green-600 hover:text-green-700 font-medium"
          >
            View all notifications
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
