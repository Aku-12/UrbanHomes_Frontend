import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { wishlistService } from '../service/wishlistService';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!localStorage.getItem('token');
  };

  // Fetch wishlist from backend
  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated()) {
      setWishlist([]);
      setWishlistIds(new Set());
      setIsLoaded(true);
      return;
    }

    setIsLoading(true);
    try {
      const data = await wishlistService.fetchWishlist({ limit: 100 });
      const rooms = data.rooms || [];
      setWishlist(rooms);
      setWishlistIds(new Set(rooms.map((room) => room._id || room.id)));
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      setWishlist([]);
      setWishlistIds(new Set());
    } finally {
      setIsLoading(false);
      setIsLoaded(true);
    }
  }, []);

  // Load wishlist on mount and when auth changes
  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  // Listen for storage changes (login/logout)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token') {
        fetchWishlist();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [fetchWishlist]);

  // Add a room to wishlist
  const addToWishlist = async (room) => {
    if (!isAuthenticated()) {
      toast.error('Please login to add to wishlist');
      return false;
    }

    const roomId = room._id || room.id;

    if (wishlistIds.has(roomId)) {
      toast.error('Already in wishlist');
      return false;
    }

    try {
      await wishlistService.addToWishlist(roomId);

      // Optimistically update the state
      const roomData = {
        ...room,
        addedToWishlistAt: new Date().toISOString(),
      };
      setWishlist((prev) => [roomData, ...prev]);
      setWishlistIds((prev) => new Set([...prev, roomId]));

      toast.success('Added to wishlist');
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add to wishlist';
      toast.error(message);
      return false;
    }
  };

  // Remove a room from wishlist
  const removeFromWishlist = async (roomId) => {
    if (!isAuthenticated()) {
      toast.error('Please login to manage wishlist');
      return false;
    }

    try {
      await wishlistService.removeFromWishlist(roomId);

      // Update local state
      setWishlist((prev) => prev.filter((item) => (item._id || item.id) !== roomId));
      setWishlistIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(roomId);
        return newSet;
      });

      toast.success('Removed from wishlist');
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to remove from wishlist';
      toast.error(message);
      return false;
    }
  };

  // Toggle wishlist status
  const toggleWishlist = async (room) => {
    if (!isAuthenticated()) {
      toast.error('Please login to manage wishlist');
      return false;
    }

    const roomId = room._id || room.id;

    try {
      const data = await wishlistService.toggleWishlist(roomId);

      if (data.isInWishlist) {
        // Added to wishlist
        const roomData = {
          ...room,
          addedToWishlistAt: new Date().toISOString(),
        };
        setWishlist((prev) => [roomData, ...prev]);
        setWishlistIds((prev) => new Set([...prev, roomId]));
        toast.success('Added to wishlist');
      } else {
        // Removed from wishlist
        setWishlist((prev) => prev.filter((item) => (item._id || item.id) !== roomId));
        setWishlistIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(roomId);
          return newSet;
        });
        toast.success('Removed from wishlist');
      }

      return data.isInWishlist;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update wishlist';
      toast.error(message);
      return null;
    }
  };

  // Check if a room is in wishlist (synchronous using local state)
  const isInWishlist = (roomId) => {
    return wishlistIds.has(roomId);
  };

  // Clear entire wishlist
  const clearWishlist = async () => {
    if (!isAuthenticated()) {
      toast.error('Please login to manage wishlist');
      return false;
    }

    try {
      // Remove each item from wishlist
      const roomIds = [...wishlistIds];
      await Promise.all(roomIds.map((id) => wishlistService.removeFromWishlist(id)));

      setWishlist([]);
      setWishlistIds(new Set());
      toast.success('Wishlist cleared');
      return true;
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      toast.error('Failed to clear wishlist');
      // Refresh to get actual state
      fetchWishlist();
      return false;
    }
  };

  // Refresh wishlist from server
  const refreshWishlist = () => {
    fetchWishlist();
  };

  const wishlistCount = wishlist.length;

  const value = {
    wishlist,
    wishlistCount,
    isLoading,
    isLoaded,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    clearWishlist,
    refreshWishlist,
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
