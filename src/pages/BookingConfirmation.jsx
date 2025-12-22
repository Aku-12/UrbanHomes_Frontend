import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, Home, Calendar, MapPin, CreditCard } from 'lucide-react';
import { Header, Footer } from '../components/layout';

const BookingConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const booking = location.state?.booking;

  if (!booking) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 mb-4">No booking information found</p>
            <button
              onClick={() => navigate('/rooms')}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Browse Rooms
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 max-w-2xl mx-auto py-12 px-4 w-full">
        <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle size={48} className="text-green-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Booking Submitted Successfully!
          </h1>
          <p className="text-gray-600 mb-8">
            Your booking request has been submitted and is pending confirmation.
            We'll notify you once it's approved.
          </p>

          {/* Booking Details */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
            <h2 className="font-semibold text-gray-900 mb-4">Booking Details</h2>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-600">
                <Calendar size={18} className="text-green-600" />
                <span>
                  Move-in: {new Date(booking.startDate).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>

              <div className="flex items-center gap-3 text-gray-600">
                <Home size={18} className="text-green-600" />
                <span>Duration: {booking.duration} month(s)</span>
              </div>

              <div className="flex items-center gap-3 text-gray-600">
                <CreditCard size={18} className="text-green-600" />
                <span>Total: Rs {booking.totalPrice?.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full mb-8">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
            <span className="font-medium">Pending Confirmation</span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/rooms"
              className="px-6 py-3 border-2 border-green-600 text-green-600 font-semibold rounded-lg hover:bg-green-50 transition-colors"
            >
              Browse More Rooms
            </Link>
            <Link
              to="/"
              className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BookingConfirmation;
