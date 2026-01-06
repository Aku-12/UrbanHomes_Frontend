import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Home,
  Calendar,
  User,
  Mail,
  Phone,
  Users,
  CreditCard,
  ChevronDown,
  ChevronRight,
  MapPin,
  Maximize,
  Wifi,
  Shield,
  Check,
  ImageOff,
  Star,
  Banknote,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Header, Footer } from '../components/layout';
import { useRoom } from '../hooks/useRooms';
import bookingApi from '../api/bookingApi';

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=500&fit=crop';

const BookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data: room, isLoading, isError } = useRoom(id);

  const [imageError, setImageError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  // Get initial values from URL params (passed from RoomDetailsPage)
  const initialMoveInDate = searchParams.get('moveInDate') || '';
  const initialDuration = searchParams.get('duration') || '12';

  // Form state
  const [bookingData, setBookingData] = useState({
    moveInDate: initialMoveInDate,
    duration: initialDuration,
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    numberOfOccupants: '1',
    paymentMethod: 'esewa',
    promoCode: '',
  });

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to make a booking');
      navigate('/login', { state: { from: `/booking/${id}` } });
    }

    // Pre-fill user info if available
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.firstName || user.lastName || user.email || user.phone) {
      setBookingData(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
      }));
    }
  }, [id, navigate]);

  // Calculate lease end date
  const leaseEndDate = useMemo(() => {
    if (!bookingData.moveInDate) return null;
    const startDate = new Date(bookingData.moveInDate);
    startDate.setMonth(startDate.getMonth() + parseInt(bookingData.duration));
    return startDate;
  }, [bookingData.moveInDate, bookingData.duration]);

  // Calculate pricing
  const pricing = useMemo(() => {
    if (!room) return { monthlyRent: 0, securityDeposit: 0, serviceFee: 100, total: 0 };
    const monthlyRent = room.price || 0;
    const securityDeposit = Math.round(monthlyRent * 0.2);
    const serviceFee = 100;
    const total = monthlyRent + securityDeposit + serviceFee;
    return { monthlyRent, securityDeposit, serviceFee, total };
  }, [room]);

  // Get room image
  const roomImage = useMemo(() => {
    if (!room) return PLACEHOLDER_IMAGE;
    if (room.images && room.images.length > 0) {
      const img = room.images[0];
      return typeof img === 'string' ? img : img?.url || PLACEHOLDER_IMAGE;
    }
    return room.image || room.imageUrl || PLACEHOLDER_IMAGE;
  }, [room]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!bookingData.moveInDate) {
      toast.error('Please select a move-in date');
      return false;
    }
    if (!bookingData.firstName || !bookingData.lastName) {
      toast.error('Please enter your full name');
      return false;
    }
    if (!bookingData.email) {
      toast.error('Please enter your email address');
      return false;
    }
    if (!bookingData.phone) {
      toast.error('Please enter your phone number');
      return false;
    }
    if (!agreeToTerms) {
      toast.error('Please agree to the Terms of Service and policies');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const startDate = new Date(bookingData.moveInDate);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + parseInt(bookingData.duration));

      const payload = {
        roomId: id,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        duration: parseInt(bookingData.duration),
        renterInfo: {
          firstName: bookingData.firstName,
          lastName: bookingData.lastName,
          email: bookingData.email,
          phone: bookingData.phone,
          numberOfOccupants: parseInt(bookingData.numberOfOccupants),
        },
        paymentMethod: bookingData.paymentMethod,
        promoCode: bookingData.promoCode || null,
      };

      const response = await bookingApi.createBooking(payload);

      if (response.data.success) {
        const booking = response.data.booking;
        
        // If payment method is esewa, initiate payment
        if (bookingData.paymentMethod === 'esewa') {
          toast.success('Booking created! Redirecting to eSewa...');
          
          // Initiate eSewa payment
          const paymentResponse = await bookingApi.initiateEsewaPayment(booking._id);
          
          if (paymentResponse.data.success) {
            const { paymentUrl, paymentData, devMode } = paymentResponse.data;
            
            // Development mode - simulate successful payment
            if (devMode) {
              toast.success('Dev Mode: Simulating successful payment...');
              navigate(`/payment/success?data=${paymentResponse.data.mockData}`);
              return;
            }
            
            // Create and submit form to eSewa
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = paymentUrl;
            
            Object.entries(paymentData).forEach(([key, value]) => {
              const input = document.createElement('input');
              input.type = 'hidden';
              input.name = key;
              input.value = value;
              form.appendChild(input);
            });
            
            document.body.appendChild(form);
            form.submit();
          }
        } else {
          // For cash payment, go directly to confirmation
          toast.success('Booking created successfully!');
          navigate('/booking/confirmation', {
            state: { booking }
          });
        }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create booking. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 max-w-7xl mx-auto py-8 px-4 w-full">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-32 bg-gray-200 rounded-xl" />
                <div className="h-48 bg-gray-200 rounded-xl" />
                <div className="h-64 bg-gray-200 rounded-xl" />
              </div>
              <div className="h-96 bg-gray-200 rounded-xl" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isError || !room) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 mb-4">Failed to load room details</p>
            <button
              onClick={() => navigate('/rooms')}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Back to Rooms
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const locationText = `${room.location?.area || ''}, ${room.location?.city || 'Kathmandu'}`;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto py-8 px-4 w-full">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Booking Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Selected Room Card */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Home size={20} className="text-green-600" />
                  Your Selected Room
                </h2>
                <div className="flex gap-4">
                  <div className="w-32 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                    {imageError ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageOff size={24} className="text-gray-400" />
                      </div>
                    ) : (
                      <img
                        src={roomImage}
                        alt={room.title}
                        className="w-full h-full object-cover"
                        onError={() => setImageError(true)}
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{room.title}</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <MapPin size={14} />
                      {locationText}
                    </p>
                    <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Home size={14} />
                        {room.roomType}
                      </span>
                      <span className="flex items-center gap-1">
                        <Maximize size={14} />
                        {room.size} sqft
                      </span>
                      {room.amenities?.wifi && (
                        <span className="flex items-center gap-1">
                          <Wifi size={14} />
                          WiFi
                        </span>
                      )}
                      {room.amenities?.furnished && (
                        <span className="flex items-center gap-1">
                          <Check size={14} />
                          Furnished
                        </span>
                      )}
                    </div>
                    {room.rating?.average > 0 && (
                      <div className="flex items-center gap-1 mt-2">
                        <Star size={14} className="text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-medium">{room.rating.average.toFixed(1)}</span>
                        <span className="text-sm text-gray-400">({room.rating.count} reviews)</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Select Dates */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar size={20} className="text-green-600" />
                  Select Your Dates
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Move-in Date
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        name="moveInDate"
                        value={bookingData.moveInDate}
                        onChange={handleChange}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                      <Calendar
                        size={18}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Renting Duration
                    </label>
                    <div className="relative">
                      <select
                        name="duration"
                        value={bookingData.duration}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white"
                      >
                        <option value="1">1 Month</option>
                        <option value="3">3 Months</option>
                        <option value="6">6 Months</option>
                        <option value="12">12 Months</option>
                      </select>
                      <ChevronDown
                        size={18}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                      />
                    </div>
                  </div>
                </div>
                {leaseEndDate && (
                  <p className="mt-4 text-sm text-green-600 flex items-center gap-2">
                    <Check size={16} />
                    Your lease ends on{' '}
                    <span className="font-semibold">
                      {leaseEndDate.toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </p>
                )}
              </div>

              {/* Renter Information */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User size={20} className="text-green-600" />
                  Renter Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="firstName"
                        value={bookingData.firstName}
                        onChange={handleChange}
                        placeholder="Akash"
                        className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                      <User
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="lastName"
                        value={bookingData.lastName}
                        onChange={handleChange}
                        placeholder="Chaudhary"
                        className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                      <User
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        name="email"
                        value={bookingData.email}
                        onChange={handleChange}
                        placeholder="akash@example.com"
                        className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                      <Mail
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        name="phone"
                        value={bookingData.phone}
                        onChange={handleChange}
                        placeholder="98XXXXXXXX"
                        className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                      <Phone
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Occupants <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        name="numberOfOccupants"
                        value={bookingData.numberOfOccupants}
                        onChange={handleChange}
                        className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white"
                      >
                        <option value="1">1 Person</option>
                        <option value="2">2 People</option>
                        <option value="3">3 People</option>
                        <option value="4">4 People</option>
                      </select>
                      <Users
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <ChevronDown
                        size={18}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard size={20} className="text-green-600" />
                  Payment Method
                </h2>
                <div className="space-y-3">
                  <label
                    className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      bookingData.paymentMethod === 'esewa'
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="esewa"
                      checked={bookingData.paymentMethod === 'esewa'}
                      onChange={handleChange}
                      className="w-5 h-5 text-green-600 focus:ring-green-500"
                    />
                    <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">e</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Esewa</p>
                      <p className="text-sm text-gray-500">Pay with your digital wallet Esewa.</p>
                    </div>
                  </label>

                  {/* Cash Payment Option */}
                  <label
                    className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      bookingData.paymentMethod === 'cash'
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash"
                      checked={bookingData.paymentMethod === 'cash'}
                      onChange={handleChange}
                      className="w-5 h-5 text-green-600 focus:ring-green-500"
                    />
                    <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                      <Banknote className="text-white" size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Cash</p>
                      <p className="text-sm text-gray-500">Pay in cash upon move-in.</p>
                    </div>
                  </label>

                </div>
              </div>

              {/* Terms Agreement */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="agreeToTerms"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="w-5 h-5 mt-0.5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <label htmlFor="agreeToTerms" className="text-sm text-gray-600">
                  I agree to the{' '}
                  <a href="/terms" className="text-green-600 hover:underline">
                    Terms of Service
                  </a>
                  ,{' '}
                  <a href="/rental-agreement" className="text-green-600 hover:underline">
                    Rental Agreement
                  </a>
                  , and{' '}
                  <a href="/cancellation-policy" className="text-green-600 hover:underline">
                    Cancellation Policy
                  </a>
                  .
                </label>
              </div>
            </div>

            {/* Right Column - Price Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2 text-green-700 bg-green-50 -mx-6 -mt-6 px-6 py-4 rounded-t-xl">
                  Price Summary
                </h2>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Monthly Rent</span>
                    <span>Rs {pricing.monthlyRent.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Security Deposit</span>
                    <span>Rs {pricing.securityDeposit.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Service Fee</span>
                    <span>Rs {pricing.serviceFee}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold text-gray-900 pt-3 border-t border-gray-200">
                    <span>Total Due Today</span>
                    <span className="text-green-600">Rs {pricing.total.toLocaleString()}</span>
                  </div>
                </div>

                {/* Promo Code */}
                <div className="mb-6">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="promoCode"
                      value={bookingData.promoCode}
                      onChange={handleChange}
                      placeholder="Enter promo code"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    />
                    <button
                      type="button"
                      className="px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors text-sm font-medium"
                    >
                      Apply
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Complete Booking
                      <ChevronRight size={18} />
                    </>
                  )}
                </button>

                {/* Trust Badges */}
                <div className="flex items-center justify-center gap-4 mt-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Shield size={14} />
                    SSL Secure
                  </span>
                  <span className="flex items-center gap-1">
                    <Check size={14} />
                    Verified
                  </span>
                </div>

                {/* Money-Back Guarantee */}
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Check size={18} className="text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900 text-sm">Money-Back Guarantee</p>
                      <p className="text-xs text-gray-600">Full refund if cancelled within 48 hours</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
};

export default BookingPage;
