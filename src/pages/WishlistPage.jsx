import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Grid, List, ChevronDown, Trash2, Loader2 } from 'lucide-react';
import { Header, Footer } from '../components/layout';
import { RoomCard } from '../components/ui';
import { useWishlist } from '../context/WishlistContext';

const WishlistPage = () => {
  const { wishlist, wishlistCount, removeFromWishlist, clearWishlist, isLoading } = useWishlist();
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('recently_added');

  // Sort wishlist based on selected option
  const getSortedWishlist = () => {
    const sorted = [...wishlist];

    switch (sortBy) {
      case 'recently_added':
        return sorted.sort((a, b) => new Date(b.addedToWishlistAt || b.addedAt) - new Date(a.addedToWishlistAt || a.addedAt));
      case 'price_low':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price_high':
        return sorted.sort((a, b) => b.price - a.price);
      case 'rating':
        return sorted.sort(
          (a, b) => (b.rating?.average || 0) - (a.rating?.average || 0)
        );
      default:
        return sorted;
    }
  };

  const sortedWishlist = getSortedWishlist();

  const handleFavoriteClick = (room) => {
    const roomId = room._id || room.id;
    removeFromWishlist(roomId);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <Heart size={24} className="text-red-500 fill-red-500" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                My Wishlist
              </h1>
              <p className="text-gray-500">Save your favorite rooms</p>
            </div>
          </div>
        </div>

        {/* Tabs and Controls */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="p-4 border-b">
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 bg-green-50 text-green-600 rounded-lg font-medium text-sm flex items-center gap-2">
                All Saved
                <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">
                  {wishlistCount}
                </span>
              </button>
            </div>
          </div>

          {/* Controls Row */}
          <div className="p-4 flex items-center justify-between">
            <p className="text-gray-500 text-sm">
              Showing {wishlistCount} saved room{wishlistCount !== 1 ? 's' : ''}
            </p>

            <div className="flex items-center gap-4">
              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="recently_added">Recently Added</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-1 border border-gray-300 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded ${
                    viewMode === 'grid'
                      ? 'bg-green-100 text-green-600'
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                  aria-label="Grid view"
                >
                  <Grid size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded ${
                    viewMode === 'list'
                      ? 'bg-green-100 text-green-600'
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                  aria-label="List view"
                >
                  <List size={18} />
                </button>
              </div>

              {/* Clear All Button */}
              {wishlistCount > 0 && (
                <button
                  onClick={clearWishlist}
                  className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
                >
                  <Trash2 size={16} />
                  Clear All
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Wishlist Content */}
        {isLoading ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="flex flex-col items-center justify-center">
              <Loader2 size={40} className="text-green-600 animate-spin mb-4" />
              <p className="text-gray-500">Loading your wishlist...</p>
            </div>
          </div>
        ) : wishlistCount === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart size={40} className="text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Start exploring rooms and click the heart icon to save your favorites here.
            </p>
            <Link
              to="/rooms"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              Browse Rooms
            </Link>
          </div>
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            }
          >
            {sortedWishlist.map((room) => (
              <RoomCard
                key={room._id || room.id}
                room={room}
                variant="detailed"
                onFavoriteClick={handleFavoriteClick}
                isFavorite={true}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default WishlistPage;
