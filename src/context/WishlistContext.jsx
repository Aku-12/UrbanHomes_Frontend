import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const WishlistContext = createContext();

const WISHLIST_STORAGE_KEY = 'urbanhomes_wishlist';

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (stored) {
        setWishlist(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
    }
    setIsLoaded(true);
  }, []);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    }
  }, [wishlist, isLoaded]);

  // Add a room to wishlist
  const addToWishlist = (room) => {
    const roomId = room._id || room.id;

    // Check if already in wishlist
    if (wishlist.some((item) => (item._id || item.id) === roomId)) {
      toast.error('Already in wishlist');
      return false;
    }

    // Store essential room data
    const roomData = {
      _id: room._id,
      id: room.id,
      title: room.title,
      location: room.location,
      price: room.price,
      rating: room.rating,
      images: room.images,
      image: room.image,
      roomType: room.roomType,
      size: room.size,
      beds: room.beds,
      amenities: room.amenities,
      isFeatured: room.isFeatured,
      isVerified: room.isVerified,
      addedAt: new Date().toISOString(),
    };

    setWishlist((prev) => [roomData, ...prev]);
    toast.success('Added to wishlist Successfully');
    return true;
  };

  // Remove a room from wishlist
  const removeFromWishlist = (roomId) => {
    setWishlist((prev) => prev.filter((item) => (item._id || item.id) !== roomId));
    toast.success('Removed from wishlist');
  };

  // Toggle wishlist status
  const toggleWishlist = (room) => {
    const roomId = room._id || room.id;
    const isInWishlist = wishlist.some((item) => (item._id || item.id) === roomId);

    if (isInWishlist) {
      removeFromWishlist(roomId);
    } else {
      addToWishlist(room);
    }
  };

  // Check if a room is in wishlist
  const isInWishlist = (roomId) => {
    return wishlist.some((item) => (item._id || item.id) === roomId);
  };

  // Clear entire wishlist
  const clearWishlist = () => {
    setWishlist([]);
    toast.success('Wishlist cleared');
  };

  // Get wishlist count
  const wishlistCount = wishlist.length;

  const value = {
    wishlist,
    wishlistCount,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    clearWishlist,
    isLoaded,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export default WishlistContext;
