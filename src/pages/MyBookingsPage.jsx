import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  ChevronRight,
  Home,
  CreditCard,
  Users,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Header, Footer } from '../components/layout';
import { bookingApi, reviewApi } from '../api';
import { getImageUrl } from '../utils/imageUtils';

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // all, confirmed, pending, cancelled

  // Review modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: '',
    cleanliness: 5,
    communication: 5,
    location: 5,
    value: 5
  });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingApi.getMyBookings();
      setBookings(response.data.bookings || []);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (activeTab === 'all') return true;
    return booking.status === activeTab;
  });

  const handleOpenReviewModal = (booking) => {
    setSelectedBooking(booking);
    setReviewData({
      rating: 5,
      comment: '',
      cleanliness: 5,
      communication: 5,
      location: 5,
      value: 5
    });
    setShowReviewModal(true);
  };

  const handleSubmitReview = async () => {
    if (!reviewData.comment.trim()) {
      toast.error('Please write a review comment');
      return;
    }

    try {
      setSubmittingReview(true);
      await reviewApi.createReview({
        bookingId: selectedBooking._id,
        ...reviewData
      });
      toast.success('Review submitted successfully!');
      setShowReviewModal(false);
      // Update the booking in state to reflect it has been reviewed
      setBookings(prev => prev.map(b =>
        b._id === selectedBooking._id ? { ...b, hasReview: true } : b
      ));
    } catch (error) {
      console.error('Failed to submit review:', error);
      toast.error(error.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const StarRating = ({ value, onChange, size = 'md' }) => {
    const sizeClass = size === 'lg' ? 'w-8 h-8' : 'w-5 h-5';
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="focus:outline-none"
          >
            <Star
              className={`${sizeClass} ${star <= value ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="pt-20 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
            <p className="text-gray-600 mt-2">View and manage your room bookings</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {[
              { key: 'all', label: 'All Bookings' },
              { key: 'confirmed', label: 'Confirmed' },
              { key: 'pending', label: 'Pending' },
              { key: 'cancelled', label: 'Cancelled' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                  activeTab === tab.key
                    ? 'bg-green-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Bookings List */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-lg">
              <Home className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
              <p className="text-gray-500 mb-6">
                {activeTab === 'all'
                  ? "You haven't made any bookings yet."
                  : `No ${activeTab} bookings found.`}
              </p>
              <Link
                to="/rooms"
                className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
              >
                Browse Rooms
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map(booking => (
                <div
                  key={booking._id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Room Image */}
                    <div className="md:w-48 h-48 md:h-auto flex-shrink-0">
                      <img
                        src={getImageUrl(booking.room?.images?.[0]?.url || booking.room?.images?.[0])}
                        alt={booking.room?.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/200x150?text=No+Image';
                        }}
                      />
                    </div>

                    {/* Booking Details */}
                    <div className="flex-1 p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <Link
                            to={`/rooms/${booking.room?._id}`}
                            className="text-lg font-semibold text-gray-900 hover:text-green-600 transition"
                          >
                            {booking.room?.title || 'Room'}
                          </Link>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <MapPin className="w-4 h-4 mr-1" />
                            {booking.room?.location?.area}, {booking.room?.location?.city}
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(booking.status)}`}>
                          {getStatusIcon(booking.status)}
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </div>

                      {/* Booking Info Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-500">Check-in</p>
                          <p className="text-sm font-medium flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {formatDate(booking.startDate)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Check-out</p>
                          <p className="text-sm font-medium flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {formatDate(booking.endDate)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Duration</p>
                          <p className="text-sm font-medium flex items-center gap-1">
                            <Clock className="w-4 h-4 text-gray-400" />
                            {booking.duration} {booking.duration === 1 ? 'month' : 'months'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Occupants</p>
                          <p className="text-sm font-medium flex items-center gap-1">
                            <Users className="w-4 h-4 text-gray-400" />
                            {booking.renterInfo?.numberOfOccupants || 1}
                          </p>
                        </div>
                      </div>

                      {/* Price and Actions */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div>
                          <p className="text-xs text-gray-500">Total Price</p>
                          <p className="text-lg font-bold text-gray-900">
                            Rs. {booking.totalPrice?.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <CreditCard className="w-3 h-3" />
                            {booking.paymentStatus === 'paid' ? (
                              <span className="text-green-600">Paid</span>
                            ) : (
                              <span className="text-yellow-600">Unpaid</span>
                            )}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          {/* Review Button - Only show for confirmed bookings without review */}
                          {booking.status === 'confirmed' && !booking.hasReview && (
                            <button
                              onClick={() => handleOpenReviewModal(booking)}
                              className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition flex items-center gap-2"
                            >
                              <Star className="w-4 h-4" />
                              Write Review
                            </button>
                          )}
                          {booking.hasReview && (
                            <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg flex items-center gap-2">
                              <CheckCircle className="w-4 h-4" />
                              Reviewed
                            </span>
                          )}
                          <Link
                            to={`/rooms/${booking.room?._id}`}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                          >
                            View Room
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Write a Review</h2>
              <button
                onClick={() => setShowReviewModal(false)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 space-y-6">
              {/* Room Info */}
              <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                <img
                  src={getImageUrl(selectedBooking.room?.images?.[0]?.url || selectedBooking.room?.images?.[0])}
                  alt={selectedBooking.room?.title}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div>
                  <p className="font-medium">{selectedBooking.room?.title}</p>
                  <p className="text-sm text-gray-500">
                    {selectedBooking.room?.location?.area}, {selectedBooking.room?.location?.city}
                  </p>
                </div>
              </div>

              {/* Overall Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Overall Rating
                </label>
                <StarRating
                  value={reviewData.rating}
                  onChange={(value) => setReviewData(prev => ({ ...prev, rating: value }))}
                  size="lg"
                />
              </div>

              {/* Detailed Ratings */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Cleanliness</label>
                  <StarRating
                    value={reviewData.cleanliness}
                    onChange={(value) => setReviewData(prev => ({ ...prev, cleanliness: value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Communication</label>
                  <StarRating
                    value={reviewData.communication}
                    onChange={(value) => setReviewData(prev => ({ ...prev, communication: value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Location</label>
                  <StarRating
                    value={reviewData.location}
                    onChange={(value) => setReviewData(prev => ({ ...prev, location: value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Value for Money</label>
                  <StarRating
                    value={reviewData.value}
                    onChange={(value) => setReviewData(prev => ({ ...prev, value: value }))}
                  />
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Review
                </label>
                <textarea
                  value={reviewData.comment}
                  onChange={(e) => setReviewData(prev => ({ ...prev, comment: e.target.value }))}
                  placeholder="Share your experience with this room..."
                  rows={4}
                  maxLength={500}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                />
                <p className="text-xs text-gray-400 text-right mt-1">
                  {reviewData.comment.length}/500 characters
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-4 border-t">
              <button
                onClick={() => setShowReviewModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReview}
                disabled={submittingReview || !reviewData.comment.trim()}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default MyBookingsPage;
