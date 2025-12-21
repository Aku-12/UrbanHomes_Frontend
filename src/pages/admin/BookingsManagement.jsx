import { useState, useEffect } from 'react';
import { Home, Eye, Check, X } from 'lucide-react';
import { adminApi } from '../../api';
import AdminLayout from '../../components/admin/AdminLayout';
import toast from 'react-hot-toast';

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

const BookingsManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });

  const fetchBookings = async (page = 1) => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (filter !== 'all') params.status = filter;
      if (sortBy) params.sortBy = sortBy;

      const response = await adminApi.getAllBookings(params);
      setBookings(response.data.bookings || []);
      setPagination({
        page: response.data.currentPage || 1,
        limit: 10,
        total: response.data.total || 0,
        pages: response.data.totalPages || 0
      });
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [filter, sortBy]);

  const handleApprove = async (bookingId) => {
    try {
      await adminApi.approveBooking(bookingId);
      toast.success('Booking approved successfully');
      fetchBookings(pagination.page);
    } catch (error) {
      console.error('Failed to approve booking:', error);
      toast.error('Failed to approve booking');
    }
  };

  const handleReject = async (bookingId) => {
    if (!window.confirm('Are you sure you want to reject this booking?')) return;

    try {
      await adminApi.rejectBooking(bookingId);
      toast.success('Booking rejected');
      fetchBookings(pagination.page);
    } catch (error) {
      console.error('Failed to reject booking:', error);
      toast.error('Failed to reject booking');
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 0,
    }).format(price).replace('NPR', 'Rs');
  };

  return (
    <AdminLayout>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Bookings Management</h1>
        <p className="text-gray-500 mt-1">Admin &gt; Bookings</p>
      </div>

      {/* Content Card */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Bookings Management</h2>
          <p className="text-gray-500 mt-1">Manage all booking requests and approvals</p>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-100 flex flex-wrap gap-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Approved</option>
            <option value="cancelled">Rejected</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="date">Sort by Date</option>
            <option value="status">Sort by Status</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">BOOKING ID</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">ROOM TITLE</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">TENANT NAME</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">LANDLORD NAME</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">BOOKING DATE</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">STATUS</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-gray-500">
                        No bookings found
                      </td>
                    </tr>
                  ) : (
                    bookings.map((booking) => (
                      <tr key={booking._id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-4 px-6">
                          <span className="text-gray-600">#{booking._id?.slice(-6).toUpperCase()}</span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                              <RoomThumbnail room={booking.room} />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{booking.room?.title || 'Unknown'}</p>
                              <p className="text-sm text-gray-500">
                                {formatPrice(booking.room?.price || 0)}/month
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
                          <span className="text-gray-900">
                            {booking.room?.owner?.firstName} {booking.room?.owner?.lastName}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-gray-600">{formatDate(booking.bookingDate || booking.createdAt)}</span>
                        </td>
                        <td className="py-4 px-6">
                          <StatusBadge status={booking.status} />
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => window.open(`/rooms/${booking.room?._id}`, '_blank')}
                              className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                              title="View Room"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {booking.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApprove(booking._id)}
                                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                                  title="Approve Booking"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleReject(booking._id)}
                                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                                  title="Reject Booking"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-2 p-6 border-t border-gray-100">
                <button
                  onClick={() => fetchBookings(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="px-3 py-1 rounded border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  &larr;
                </button>
                {[...Array(Math.min(pagination.pages, 5))].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => fetchBookings(i + 1)}
                    className={`w-8 h-8 rounded ${
                      pagination.page === i + 1
                        ? 'bg-green-500 text-white'
                        : 'border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => fetchBookings(pagination.page + 1)}
                  disabled={pagination.page >= pagination.pages}
                  className="px-3 py-1 rounded border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  &rarr;
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default BookingsManagement;
