import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Star,
  Share2,
  Heart,
  Home,
  Maximize,
  Users,
  Layers,
  Wifi,
  Tv,
  Wind,
  Flame,
  UtensilsCrossed,
  Car,
  Shirt,
  Sofa,
  PawPrint,
  Shield,
  ChevronLeft,
  ChevronRight,
  Check,
  Calendar,
  ChevronDown,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import toast from 'react-hot-toast';
import { Header, Footer } from '../components/layout';
import { useRoom } from '../hooks/useRooms';
import { useWishlist } from '../context';

// Fix for default marker icon in Leaflet with Vite
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

// Amenity icons mapping
const amenityIcons = {
  wifi: { icon: Wifi, label: 'High-Speed WiFi' },
  tv: { icon: Tv, label: 'Smart TV' },
  airConditioning: { icon: Wind, label: 'Air Conditioning' },
  heating: { icon: Flame, label: 'Heating' },
  kitchen: { icon: UtensilsCrossed, label: 'Full Kitchen' },
  parking: { icon: Car, label: 'Parking' },
  laundry: { icon: Shirt, label: 'Laundry' },
  furnished: { icon: Sofa, label: 'Furnished' },
  petFriendly: { icon: PawPrint, label: 'Pet Friendly' },
  security: { icon: Shield, label: '24/7 Security' },
  balcony: { icon: Home, label: 'Balcony' },
};

const RoomDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: room, isLoading, isError, error } = useRoom(id);
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  // Booking form state
  const [bookingData, setBookingData] = useState({
    moveInDate: '',
    leaseDuration: '12',
    renters: '1',
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          <div className="animate-pulse">
            <div className="h-96 bg-gray-200 rounded-xl mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-8 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-32 bg-gray-200 rounded" />
              </div>
              <div className="h-96 bg-gray-200 rounded-xl" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 mb-4">
              {error?.message || 'Failed to load room details'}
            </p>
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

  if (!room) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 mb-4">Room not found</p>
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

  const images = room.images?.length > 0
    ? room.images.map((img) => img.url)
    : ['https://via.placeholder.com/800x500?text=No+Image'];

  const locationText = `${room.location?.area}, ${room.location?.city}`;
  const coordinates = room.location?.coordinates || { latitude: 27.7172, longitude: 85.324 }; // Default to Kathmandu

  // Get active amenities
  const activeAmenities = room.amenities
    ? Object.entries(room.amenities)
        .filter(([_, value]) => value)
        .map(([key]) => key)
    : [];

  const displayedAmenities = showAllAmenities
    ? activeAmenities
    : activeAmenities.slice(0, 5);

  // Calculate pricing
  const securityDeposit = Math.round(room.price * 0.2);
  const serviceFee = 100;
  const totalPrice = room.price + securityDeposit + serviceFee;

  // Mock reviews (would come from API)
  const reviews = [
    {
      id: 1,
      user: { name: 'Ram Prasad', avatar: null },
      date: 'November 2025',
      rating: 5,
      comment: 'Absolutely stunning room with all the amenities!',
    },
    {
      id: 2,
      user: { name: 'Sita Rana', avatar: null },
      date: 'October 2025',
      comment:
        'This studio exceeded all my expectations. The natural light streaming through those huge windows every morning was magical.',
      rating: 5,
    },
  ];

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: room.title,
        text: `Check out this room: ${room.title}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleFavorite = () => {
    if (room) {
      toggleWishlist(room);
    }
  };

  const isFavorite = room ? isInWishlist(room._id || room.id) : false;

  const handleRentNow = () => {
    if (!bookingData.moveInDate) {
      toast.error('Please select a move-in date');
      return;
    }
    toast.success('Redirecting to payment...');
  };

  const handleInquiry = () => {
    toast.success('Inquiry sent to landlord!');
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Image Gallery */}
        <div className="relative rounded-xl overflow-hidden mb-8">
          <div className="relative h-[400px] md:h-[500px]">
            <img
              src={images[currentImageIndex]}
              alt={`${room.title} - Image ${currentImageIndex + 1}`}
              className="w-full h-full object-cover"
            />

            {/* Image Navigation */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                >
                  <ChevronRight size={24} />
                </button>

                {/* Image Dots */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentImageIndex
                          ? 'bg-white'
                          : 'bg-white/50 hover:bg-white/75'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Room Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title Section */}
            <div>
              {/* Verified Badge */}
              {room.isVerified && (
                <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-sm font-medium px-3 py-1 rounded-full mb-3">
                  <Check size={14} />
                  Verified
                </span>
              )}

              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                {room.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin size={16} className="text-gray-400" />
                  <span>{locationText}</span>
                </div>

                {room.rating?.average > 0 && (
                  <div className="flex items-center gap-1">
                    <Star size={16} className="text-yellow-400 fill-yellow-400" />
                    <span className="font-medium">{room.rating.average.toFixed(1)}</span>
                    <span className="text-gray-400">({room.rating.count} reviews)</span>
                  </div>
                )}
              </div>

              {/* Share and Save Buttons */}
              <div className="flex gap-4 mt-4">
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Share2 size={18} />
                  <span>Share</span>
                </button>
                <button
                  onClick={handleFavorite}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Heart
                    size={18}
                    className={isFavorite ? 'text-red-500 fill-red-500' : ''}
                  />
                  <span>Save</span>
                </button>
              </div>
            </div>

            {/* Room Specs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-white rounded-xl shadow-sm">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Home size={24} className="text-gray-600" />
                </div>
                <p className="font-semibold text-gray-900">{room.roomType}</p>
                <p className="text-sm text-gray-500">Room Type</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Maximize size={24} className="text-gray-600" />
                </div>
                <p className="font-semibold text-gray-900">{room.size} sqft</p>
                <p className="text-sm text-gray-500">Size</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Users size={24} className="text-gray-600" />
                </div>
                <p className="font-semibold text-gray-900">{room.beds || 2} Max</p>
                <p className="text-sm text-gray-500">Renters</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Layers size={24} className="text-gray-600" />
                </div>
                <p className="font-semibold text-gray-900">Floor {room.floor || 2}</p>
                <p className="text-sm text-gray-500">Level</p>
              </div>
            </div>

            {/* About Section */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Home size={20} className="text-green-600" />
                About this place
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {showFullDescription
                  ? room.description
                  : `${room.description?.slice(0, 200)}${room.description?.length > 200 ? '...' : ''}`}
              </p>
              {room.description?.length > 200 && (
                <button
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="text-green-600 font-medium mt-2 hover:text-green-700"
                >
                  {showFullDescription ? 'Show less' : 'Read more'}
                </button>
              )}
            </div>

            {/* Amenities Section */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Star size={20} className="text-green-600" />
                What this place offers
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {displayedAmenities.map((amenity) => {
                  const amenityInfo = amenityIcons[amenity];
                  if (!amenityInfo) return null;
                  const IconComponent = amenityInfo.icon;
                  return (
                    <div
                      key={amenity}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                        <IconComponent size={20} className="text-gray-600" />
                      </div>
                      <span className="text-gray-700">{amenityInfo.label}</span>
                    </div>
                  );
                })}
              </div>
              {activeAmenities.length > 5 && (
                <button
                  onClick={() => setShowAllAmenities(!showAllAmenities)}
                  className="mt-4 w-full py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  {showAllAmenities
                    ? 'Show less'
                    : `Show all ${activeAmenities.length} amenities`}
                </button>
              )}
            </div>

            {/* Map Section */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin size={20} className="text-green-600" />
                Location
              </h2>
              <p className="text-gray-600 mb-4">{room.location?.address || locationText}</p>
              <div className="h-64 rounded-lg overflow-hidden">
                <MapContainer
                  center={[coordinates.latitude, coordinates.longitude]}
                  zoom={15}
                  style={{ height: '100%', width: '100%' }}
                  scrollWheelZoom={false}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[coordinates.latitude, coordinates.longitude]}>
                    <Popup>
                      <div className="text-center">
                        <strong>{room.title}</strong>
                        <br />
                        {locationText}
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-4xl font-bold text-gray-900">
                  {room.rating?.average?.toFixed(1) || '0.0'}
                </span>
                <div>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={20}
                        className={
                          i < Math.round(room.rating?.average || 0)
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }
                      />
                    ))}
                  </div>
                  <p className="text-gray-500 text-sm">
                    {room.rating?.count || 0} reviews
                  </p>
                </div>
              </div>

              {/* Reviews List */}
              <div className="space-y-6">
                {(showAllReviews ? reviews : reviews.slice(0, 2)).map((review) => (
                  <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-gray-600 font-medium">
                            {review.user.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{review.user.name}</p>
                          <p className="text-sm text-gray-500">{review.date}</p>
                        </div>
                      </div>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={
                              i < review.rating
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300'
                            }
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600">{review.comment}</p>
                  </div>
                ))}
              </div>

              {room.rating?.count > 2 && (
                <button
                  onClick={() => setShowAllReviews(!showAllReviews)}
                  className="mt-4 w-full py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  {showAllReviews
                    ? 'Show less'
                    : `Show all ${room.rating.count} reviews`}
                </button>
              )}
            </div>
          </div>

          {/* Right Column - Booking Widget */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              {/* Price */}
              <div className="mb-6">
                <p className="text-3xl font-bold text-green-600">
                  Rs {room.price?.toLocaleString()}
                  <span className="text-lg font-normal text-gray-500">/month</span>
                </p>
                {room.rating?.average > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <Star size={16} className="text-yellow-400 fill-yellow-400" />
                    <span className="font-medium">{room.rating.average.toFixed(1)}</span>
                    <span className="text-gray-400">({room.rating.count} reviews)</span>
                  </div>
                )}
              </div>

              {/* Booking Form */}
              <div className="space-y-4">
                {/* Move-in Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Move-in Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={bookingData.moveInDate}
                      onChange={(e) =>
                        setBookingData({ ...bookingData, moveInDate: e.target.value })
                      }
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <Calendar
                      size={18}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    />
                  </div>
                </div>

                {/* Lease Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lease Duration
                  </label>
                  <div className="relative">
                    <select
                      value={bookingData.leaseDuration}
                      onChange={(e) =>
                        setBookingData({ ...bookingData, leaseDuration: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white"
                    >
                      <option value="1">1 month</option>
                      <option value="3">3 months</option>
                      <option value="6">6 months</option>
                      <option value="12">12 months</option>
                    </select>
                    <ChevronDown
                      size={18}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    />
                  </div>
                </div>

                {/* Renters */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Renters
                  </label>
                  <div className="relative">
                    <select
                      value={bookingData.renters}
                      onChange={(e) =>
                        setBookingData({ ...bookingData, renters: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white"
                    >
                      <option value="1">1 Renter</option>
                      <option value="2">2 Renters</option>
                      <option value="3">3 Renters</option>
                      <option value="4">4 Renters</option>
                    </select>
                    <ChevronDown
                      size={18}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    />
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Sub Total</span>
                  <span>Rs {room.price?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Security deposit</span>
                  <span>Rs {securityDeposit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Service fee</span>
                  <span className="text-green-600">Rs {serviceFee}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold text-gray-900 pt-3 border-t border-gray-200">
                  <span>Total</span>
                  <span className="text-green-600">Rs {totalPrice.toLocaleString()}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 space-y-3">
                <button
                  onClick={handleRentNow}
                  className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  Rent Now
                  <ChevronRight size={18} />
                </button>
                <button
                  onClick={handleInquiry}
                  className="w-full py-3 border-2 border-green-600 text-green-600 font-semibold rounded-lg hover:bg-green-50 transition-colors flex items-center justify-center gap-2"
                >
                  Inquiry to Landlord
                  <ChevronRight size={18} />
                </button>
              </div>

              <p className="text-center text-sm text-gray-500 mt-4">
                You won't be charged yet
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RoomDetailsPage;
