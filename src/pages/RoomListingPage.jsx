import { useState, useMemo } from 'react';
import { Filter, Grid, List, ChevronDown } from 'lucide-react';
import { Header, Footer } from '../components/layout';
import { RoomCard, Input, Checkbox } from '../components/ui';
import { useRooms } from '../hooks/useRooms';
import { useWishlist } from '../context';

const RoomListingPage = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(true);
  const { toggleWishlist, isInWishlist } = useWishlist();

  // Filter states
  const [filters, setFilters] = useState({
    city: '',
    roomType: 'All Types',
    minPrice: '',
    maxPrice: '',
    beds: '',
    amenities: {
      wifi: false,
      airConditioning: false,
      parking: false,
      laundry: false,
      furnished: false,
      petFriendly: false,
    },
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Room types for dropdown
  const roomTypes = ['All Types', 'Studio', 'Private', 'Shared', '1BHK', '2BHK', '3BHK', 'Apartment'];

  // Bedroom options
  const bedroomOptions = ['Any', '1', '2', '3', '4+'];

  // Build query params for API
  const queryParams = useMemo(() => {
    const params = {
      page: currentPage,
      limit: 12,
    };

    if (filters.city) params.city = filters.city;
    if (filters.roomType && filters.roomType !== 'All Types') params.roomType = filters.roomType;
    if (filters.minPrice) params.minPrice = filters.minPrice;
    if (filters.maxPrice) params.maxPrice = filters.maxPrice;
    if (filters.beds && filters.beds !== 'Any') params.beds = filters.beds;

    // Build amenities string
    const selectedAmenities = Object.entries(filters.amenities)
      .filter(([_, value]) => value)
      .map(([key]) => key);
    if (selectedAmenities.length > 0) {
      params.amenities = selectedAmenities.join(',');
    }

    return params;
  }, [filters, currentPage]);

  // Fetch rooms using React Query
  const { data, isLoading, isError, error } = useRooms(queryParams);

  const rooms = data?.rooms || [];
  const totalRooms = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setCurrentPage(1);
  };

  const handleAmenityChange = (amenity) => {
    setFilters((prev) => ({
      ...prev,
      amenities: {
        ...prev.amenities,
        [amenity]: !prev.amenities[amenity],
      },
    }));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      city: '',
      roomType: 'All Types',
      minPrice: '',
      maxPrice: '',
      beds: '',
      amenities: {
        wifi: false,
        airConditioning: false,
        parking: false,
        laundry: false,
        furnished: false,
        petFriendly: false,
      },
    });
    setCurrentPage(1);
  };

  const handleFavoriteClick = (room) => {
    toggleWishlist(room);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto py-8 w-full">
        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <aside
            className={`${
              showFilters ? 'w-64' : 'w-0'
            } flex-shrink-0 transition-all duration-300 overflow-hidden`}
          >
            <div className="bg-white rounded-xl p-4 shadow-sm">
              {/* Filters Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Filter size={20} className="text-gray-600" />
                  <span className="font-semibold text-gray-900">Filters</span>
                </div>
                <button
                  onClick={handleClearFilters}
                  className="text-green-600 text-sm font-medium hover:text-green-700"
                >
                  Clear All
                </button>
              </div>

              {/* Location Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <Input
                  type="text"
                  placeholder="City"
                  value={filters.city}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                />
              </div>

              {/* Room Type Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Room Type
                </label>
                <div className="relative">
                  <select
                    value={filters.roomType}
                    onChange={(e) => handleFilterChange('roomType', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white"
                  >
                    {roomTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={18}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range (per month)
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  />
                  <span className="text-gray-400">to</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  />
                </div>
              </div>

              {/* Bedrooms Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bedrooms
                </label>
                <div className="relative">
                  <select
                    value={filters.beds}
                    onChange={(e) => handleFilterChange('beds', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white"
                  >
                    {bedroomOptions.map((option) => (
                      <option key={option} value={option === 'Any' ? '' : option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={18}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
              </div>

              {/* Amenities Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Amenities
                </label>
                <div className="space-y-4">
                  <Checkbox
                    label="WiFi"
                    checked={filters.amenities.wifi}
                    onChange={() => handleAmenityChange('wifi')}
                  />
                  <Checkbox
                    label="Air Conditioning"
                    checked={filters.amenities.airConditioning}
                    onChange={() => handleAmenityChange('airConditioning')}
                  />
                  <Checkbox
                    label="Parking"
                    checked={filters.amenities.parking}
                    onChange={() => handleAmenityChange('parking')}
                  />
                  <Checkbox
                    label="Laundry"
                    checked={filters.amenities.laundry}
                    onChange={() => handleAmenityChange('laundry')}
                  />
                  <Checkbox
                    label="Furnished"
                    checked={filters.amenities.furnished}
                    onChange={() => handleAmenityChange('furnished')}
                  />
                  <Checkbox
                    label="Pet Friendly"
                    checked={filters.amenities.petFriendly}
                    onChange={() => handleAmenityChange('petFriendly')}
                  />
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Header with count and view toggle */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-2xl font-bold text-gray-900">{totalRooms}</span>
                <span className="text-gray-500 ml-2">rooms available</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg ${
                    viewMode === 'grid'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                  aria-label="Grid view"
                >
                  <Grid size={20} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg ${
                    viewMode === 'list'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                  aria-label="List view"
                >
                  <List size={20} />
                </button>
              </div>
            </div>

            {/* Error State */}
            {isError && (
              <div className="text-center py-12">
                <p className="text-red-500 mb-4">
                  {error?.message || 'Failed to load rooms. Please try again.'}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Room Cards Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl overflow-hidden shadow-sm animate-pulse"
                  >
                    <div className="w-full h-48 bg-gray-200" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                      <div className="h-4 bg-gray-200 rounded w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : rooms.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No rooms found matching your criteria.</p>
                <button
                  onClick={handleClearFilters}
                  className="mt-4 text-green-600 hover:text-green-700 font-medium"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5'
                    : 'space-y-4'
                }
              >
                {rooms.map((room) => (
                  <RoomCard
                    key={room._id || room.id}
                    room={room}
                    variant="detailed"
                    onFavoriteClick={handleFavoriteClick}
                    isFavorite={isInWishlist(room._id || room.id)}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && !isLoading && rooms.length > 0 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-lg ${
                        currentPage === page
                          ? 'bg-green-600 text-white'
                          : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}

                {totalPages > 5 && (
                  <>
                    <span className="text-gray-400">...</span>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      className={`w-10 h-10 rounded-lg ${
                        currentPage === totalPages
                          ? 'bg-green-600 text-white'
                          : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {totalPages}
                    </button>
                  </>
                )}

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RoomListingPage;
