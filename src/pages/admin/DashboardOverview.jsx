import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Home, Calendar, Users, Ban, TrendingUp } from 'lucide-react';
import { adminApi } from '../../api';
import AdminLayout from '../../components/admin/AdminLayout';

// Helper to get image URL from room
const getRoomImageUrl = (room) => {
  if (room?.images && Array.isArray(room.images) && room.images.length > 0) {
    const firstImage = room.images[0];
    if (typeof firstImage === 'string') return firstImage;
    if (firstImage?.url) return firstImage.url;
  }
  return null;
};

// Room thumbnail component with error handling
const RoomThumbnail = ({ room }) => {
  const [error, setError] = useState(false);
  const imageUrl = getRoomImageUrl(room);

  if (!imageUrl || error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <Home className="w-5 h-5 text-gray-400" />
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={room?.title || 'Room'}
      className="w-full h-full object-cover"
      onError={() => setError(true)}
    />
  );
};

const StatCard = ({ icon: Icon, value, label, trend, iconBg, iconColor }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6">
    <div className="flex items-start justify-between">
      <div className={`w-12 h-12 ${iconBg} rounded-lg flex items-center justify-center`}>
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>
      {trend && (
        <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
          <TrendingUp className="w-4 h-4" />
          {trend}
        </span>
      )}
    </div>
    <div className="mt-4">
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="text-gray-500 mt-1">{label}</p>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    pending: 'bg-orange-100 text-orange-600',
    confirmed: 'bg-green-100 text-green-600',
    approved: 'bg-green-100 text-green-600',
    cancelled: 'bg-red-100 text-red-600',
    rejected: 'bg-red-100 text-red-600',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const DashboardOverview = () => {
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, bookingsRes] = await Promise.all([
          adminApi.getDashboardStats(),
          adminApi.getRecentBookings(5)
        ]);
        setStats(statsRes.data.stats);
        setRecentBookings(bookingsRes.data.bookings || []);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500 mt-1">Admin &gt; Dashboard</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Home}
          value={stats?.totalRooms || 0}
          label="Total Rooms"
          trend="+12%"
          iconBg="bg-orange-100"
          iconColor="text-orange-500"
        />
        <StatCard
          icon={Calendar}
          value={stats?.totalBookings || 0}
          label="Total Bookings"
          iconBg="bg-blue-100"
          iconColor="text-blue-500"
        />
        <StatCard
          icon={Users}
          value={stats?.activeUsers || 0}
          label="Active Users"
          iconBg="bg-green-100"
          iconColor="text-green-500"
        />
        <StatCard
          icon={Ban}
          value={stats?.blockedUsers || 0}
          label="Blocked Users"
          iconBg="bg-pink-100"
          iconColor="text-pink-500"
        />
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
          <Link
            to="/admin/bookings"
            className="px-4 py-2 border border-green-500 text-green-500 rounded-lg hover:bg-green-50 transition-colors text-sm font-medium"
          >
            View All
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">BOOKING ID</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">ROOM</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">TENANT</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">DATE</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">
                    No recent bookings found
                  </td>
                </tr>
              ) : (
                recentBookings.map((booking) => (
                  <tr key={booking._id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <span className="text-gray-600">#{booking._id?.slice(-6).toUpperCase() || 'N/A'}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden">
                          <RoomThumbnail room={booking.room} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{booking.room?.title || 'Unknown Room'}</p>
                          <p className="text-sm text-gray-500">
                            {booking.room?.location?.area}, {booking.room?.location?.city}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-gray-900">
                        {booking.user?.firstName} {booking.user?.lastName}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-gray-600">{formatDate(booking.bookingDate || booking.createdAt)}</span>
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={booking.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default DashboardOverview;
