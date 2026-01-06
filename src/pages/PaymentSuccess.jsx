import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Check, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { Header, Footer } from '../components/layout';
import bookingApi from '../api/bookingApi';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Get the base64 encoded data from URL
        const data = searchParams.get('data');
        
        if (!data) {
          setError('Payment data not found');
          setVerifying(false);
          return;
        }

        // Verify payment with backend
        const response = await bookingApi.verifyEsewaPayment(data);
        
        if (response.data.success) {
          setVerified(true);
          setBooking(response.data.booking);
          toast.success('Payment verified successfully!');
        } else {
          setError(response.data.message || 'Payment verification failed');
        }
      } catch (err) {
        console.error('Payment verification error:', err);
        setError(err.response?.data?.message || 'Failed to verify payment');
        toast.error('Payment verification failed');
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [searchParams]);

  const handleCancelBooking = async () => {
    if (!booking?._id) return;
    
    if (!window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
      return;
    }

    setCancelling(true);
    try {
      const response = await bookingApi.cancelBooking(booking._id);
      if (response.data.success) {
        toast.success('Booking cancelled successfully');
        navigate('/rooms');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  // Generate booking reference
  const getBookingReference = () => {
    if (!booking?._id) return '';
    const year = new Date().getFullYear();
    const shortId = booking._id.slice(-5).toUpperCase();
    return `UH-${year}-${shortId}`;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (verifying) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FDF8F3]">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-16 h-16 text-green-600 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Verifying Payment...</h2>
            <p className="text-gray-600">Please wait while we confirm your payment with eSewa.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FDF8F3]">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <X className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Verification Failed</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/profile')}
                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                View My Bookings
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back to Home
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FDF8F3]">
      <Header />
      
      <main className="flex-1 py-12 px-4">
        <div className="max-w-md mx-auto">
          {/* Success Icon */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-white" strokeWidth={3} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Payment Successful</h1>
            <p className="text-gray-500">Your booking has been confirmed</p>
          </div>

          {/* Booking Details Card */}
          {booking && (
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
              {/* Booking Reference */}
              <div className="text-center mb-6">
                <p className="text-sm text-gray-400 mb-1">Booking Reference</p>
                <p className="text-xl font-semibold text-green-600">{getBookingReference()}</p>
              </div>

              {/* Details */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Room</span>
                  <span className="font-medium text-gray-900">{booking.roomTitle || 'Room Booked'}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Move-in</span>
                  <span className="font-medium text-gray-900">{formatDate(booking.startDate)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Duration</span>
                  <span className="font-medium text-gray-900">{booking.duration} Months</span>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Total Paid</span>
                    <span className="text-xl font-bold text-green-600">
                      Rs {booking.totalPrice?.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => navigate('/')}
              className="w-full px-6 py-3.5 bg-white text-gray-700 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors font-medium shadow-sm"
            >
              Back to Home
            </button>
            
            <button
              onClick={handleCancelBooking}
              disabled={cancelling}
              className="w-full px-6 py-3.5 bg-red-50 text-red-600 rounded-xl border border-red-200 hover:bg-red-100 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {cancelling ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                'Cancel Booking'
              )}
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentSuccess;
