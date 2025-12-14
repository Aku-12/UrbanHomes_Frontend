import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Shield,
  Heart,
  CheckCircle,
  Star,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { Header, Footer } from '../components/layout';
import { Button, RoomCard } from '../components/ui';
import { useFeaturedRooms } from '../hooks/useFeaturedRooms';
import { usePopularRooms } from '../hooks/usePopularRooms';
import { useWishlist } from '../context';

const LandingPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { toggleWishlist, isInWishlist } = useWishlist();

  // Fetch featured and popular rooms from API
  const { data: featuredRooms, isLoading: featuredLoading, error: featuredError } = useFeaturedRooms(6);
  const { data: popularRooms, isLoading: popularLoading, error: popularError } = usePopularRooms('Kathmandu', 6);

  const handleFavoriteClick = (room) => {
    toggleWishlist(room);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/rooms?city=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/rooms');
    }
  };

  // Stats data
  const stats = [
    { value: '25+', label: 'Key Partners' },
    { value: '4+', label: 'Cities Covered' },
    { value: '1K+', label: 'Happy Members' },
  ];

  // Features data
  const features = [
    {
      icon: Search,
      title: 'Easy Search',
      description: 'Find rooms quickly with our smart filters for location, budget, and amenities.',
    },
    {
      icon: Shield,
      title: 'Verified Rooms',
      description: 'Every listing is verified so you can move in with complete peace of mind.',
    },
    {
      icon: CheckCircle,
      title: 'Secure Booking',
      description: 'Our secure booking system helps you confirm your room without any hassle.',
    },
    {
      icon: Heart,
      title: 'Wishlist',
      description: 'Save your favorite rooms and compare them before making your choice.',
    },
  ];

  // Testimonials data
  const testimonials = [
    {
      id: 1,
      name: 'Ram Prasad',
      role: 'Software Developer',
      content: 'Found my perfect apartment in just 2 days! The search filters made it so easy to narrow down exactly what I was looking for.',
      rating: 5,
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    },
    {
      id: 2,
      name: 'Arun Chaudhary',
      role: 'Medical Student',
      content: 'The verified listings gave me confidence. No nasty surprises when I moved in - everything was exactly as shown.',
      rating: 5,
      avatar: 'https://randomuser.me/api/portraits/men/44.jpg',
    },
    {
      id: 3,
      name: 'Risha Sharma',
      role: 'Marketing Manager',
      content: 'As a student on a budget, this platform helped me find an affordable room near my campus. The wishlist feature was super helpful!',
      rating: 5,
      avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
    },
  ];

  // Use featured rooms if available, fallback to popular rooms
  const displayRooms = featuredRooms?.length > 0 ? featuredRooms : popularRooms;
  const isLoading = featuredLoading || popularLoading;
  const hasError = featuredError && popularError;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-50 to-white py-12 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                Find a Room That Feels{' '}
                <span className="text-green-600">Like Home</span>
              </h1>
              <p className="text-gray-600 mb-8 max-w-lg">
                Search for comfortable, verified rooms at your preferred location and budget. Discover your perfect living space with just a few clicks.
              </p>

              {/* Search Bar */}
              <div className="flex gap-2 mb-8">
                <div className="flex-1 relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Enter city or area..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <Button variant="primary" size="md" showArrow onClick={handleSearch}>
                  Search Rooms
                </Button>
              </div>

              {/* Stats */}
              <div className="flex gap-8">
                {stats.map((stat, index) => (
                  <div key={index}>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Image */}
            <div className="hidden lg:block">
              <img
                src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=500&fit=crop"
                alt="Cozy living room"
                className="rounded-2xl shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-green-600 text-sm font-medium uppercase tracking-wider">
              Why Choose Us
            </span>
            <h2 className="text-3xl font-bold text-gray-900 mt-2">
              Simple Steps to Your New Home
            </h2>
            <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
              We make room hunting easy and stress-free with our trusted platform
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-xl hover:shadow-lg transition-shadow"
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="text-green-600" size={28} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Rooms Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-green-600 text-sm font-medium uppercase tracking-wider">
                Featured
              </span>
              <h2 className="text-3xl font-bold text-gray-900 mt-1">
                Popular Rooms Near You
              </h2>
            </div>
            <Link
              to="/rooms"
              className="hidden sm:flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
            >
              View all rooms <ArrowRight size={18} />
            </Link>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-green-600" />
              <span className="ml-2 text-gray-600">Loading rooms...</span>
            </div>
          )}

          {/* Error State */}
          {hasError && !isLoading && (
            <div className="text-center py-12">
              <p className="text-gray-500">Unable to load rooms. Please try again later.</p>
            </div>
          )}

          {/* Rooms Grid */}
          {!isLoading && !hasError && displayRooms && displayRooms.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayRooms.map((room) => (
                <RoomCard
                  key={room._id || room.id}
                  room={room}
                  onFavoriteClick={handleFavoriteClick}
                  isFavorite={isInWishlist(room._id || room.id)}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !hasError && (!displayRooms || displayRooms.length === 0) && (
            <div className="text-center py-12">
              <p className="text-gray-500">No rooms available at the moment.</p>
            </div>
          )}

          <Link
            to="/rooms"
            className="sm:hidden flex items-center justify-center gap-2 text-green-600 hover:text-green-700 font-medium mt-6"
          >
            View all rooms <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-green-600 text-sm font-medium uppercase tracking-wider">
              Reviews
            </span>
            <h2 className="text-3xl font-bold text-gray-900 mt-2">
              What Our Users Say
            </h2>
            <p className="text-gray-600 mt-2">
              Trusted by thousands of happy renters across the city
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-gray-50 rounded-xl p-6"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6">"{testimonial.content}"</p>
                <div className="flex items-center gap-3">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Find Your New Home?
          </h2>
          <p className="text-green-100 mb-8 max-w-2xl mx-auto">
            Join thousands of happy renters and find the perfect room that fits your lifestyle and budget.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/rooms">
              <Button
                variant="secondary"
                size="lg"
                className="bg-white text-green-600 hover:bg-gray-100"
              >
                Start Browsing
              </Button>
            </Link>
            <Link to="/register">
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-green-600"
              >
                List Your Room
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
