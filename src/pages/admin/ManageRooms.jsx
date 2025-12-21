import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Home, Plus, Pencil, Trash2, Power, ImageOff } from 'lucide-react';
import { adminApi } from '../../api';
import AdminLayout from '../../components/admin/AdminLayout';
import toast from 'react-hot-toast';

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=100&h=100&fit=crop';

// Helper to get image URL from room
const getRoomImageUrl = (room) => {
  if (room.images && Array.isArray(room.images) && room.images.length > 0) {
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
      alt={room.title}
      className="w-full h-full object-cover"
      onError={() => setError(true)}
    />
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    available: 'bg-green-100 text-green-600',
    active: 'bg-green-100 text-green-600',
    rented: 'bg-blue-100 text-blue-600',
    pending: 'bg-orange-100 text-orange-600',
    inactive: 'bg-gray-100 text-gray-600',
  };

  const displayStatus = status === 'available' ? 'Active' : status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status] || styles.active}`}>
      {displayStatus}
    </span>
  );
};

const ManageRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });

  const fetchRooms = async (page = 1) => {
    try {
      setLoading(true);
      const response = await adminApi.getAllRooms({ page, limit: 10 });
      setRooms(response.data.rooms || []);
      setPagination({
        page: response.data.currentPage || 1,
        limit: 10,
        total: response.data.total || 0,
        pages: response.data.totalPages || 0
      });
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
      toast.error('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleToggleStatus = async (roomId) => {
    try {
      await adminApi.toggleRoomStatus(roomId);
      toast.success('Room status updated');
      fetchRooms(pagination.page);
    } catch (error) {
      console.error('Failed to toggle status:', error);
      toast.error('Failed to update room status');
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm('Are you sure you want to delete this room?')) return;

    try {
      await adminApi.deleteRoom(roomId);
      toast.success('Room deleted successfully');
      fetchRooms(pagination.page);
    } catch (error) {
      console.error('Failed to delete room:', error);
      toast.error('Failed to delete room');
    }
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
        <h1 className="text-2xl font-bold text-gray-900">Manage Rooms</h1>
        <p className="text-gray-500 mt-1">Admin &gt; Manage</p>
      </div>

      {/* Content Card */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Manage Rooms</h2>
              <p className="text-gray-500 mt-1">View, edit and manage all room listings</p>
            </div>
          </div>
        </div>

        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">All Room Listings</h3>
            <Link
              to="/admin/rooms/add"
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Add New Room
            </Link>
          </div>
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
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">ROOM</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">LANDLORD</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">PRICE</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">LOCATION</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">STATUS</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-gray-500">
                        No rooms found
                      </td>
                    </tr>
                  ) : (
                    rooms.map((room) => (
                      <tr key={room._id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                              <RoomThumbnail room={room} />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{room.title}</p>
                              <p className="text-sm text-gray-500">
                                {room.roomType} • {room.beds} Bed{room.beds !== 1 ? 's' : ''} • {room.amenities?.wifi ? 'WiFi' : ''} {room.amenities?.parking ? '• Parking' : ''}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-gray-900">
                            {room.owner?.firstName} {room.owner?.lastName}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-gray-900">{formatPrice(room.price)}/mo</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-gray-600">
                            {room.location?.area}, {room.location?.city}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <StatusBadge status={room.status} />
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleStatus(room._id)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                              title="Toggle Status"
                            >
                              <Power className="w-4 h-4" />
                            </button>
                            <Link
                              to={`/admin/rooms/edit/${room._id}`}
                              className="w-8 h-8 flex items-center justify-center rounded-lg bg-orange-100 text-orange-600 hover:bg-orange-200 transition-colors"
                              title="Edit Room"
                            >
                              <Pencil className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDeleteRoom(room._id)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                              title="Delete Room"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
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
                  onClick={() => fetchRooms(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="px-3 py-1 rounded border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  &larr;
                </button>
                {[...Array(pagination.pages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => fetchRooms(i + 1)}
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
                  onClick={() => fetchRooms(pagination.page + 1)}
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

export default ManageRooms;
