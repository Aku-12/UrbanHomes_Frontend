import api from "./axios";

const wishlistApi = {
  // Get user's wishlist
  getWishlist: (params) => api.get("/wishlist", { params }),

  // Add room to wishlist
  addToWishlist: (roomId) => api.post("/wishlist", { roomId }),

  // Toggle wishlist (add/remove)
  toggleWishlist: (roomId) => api.post(`/wishlist/toggle/${roomId}`),

  // Check if room is in wishlist
  checkWishlist: (roomId) => api.get(`/wishlist/check/${roomId}`),

  // Remove room from wishlist
  removeFromWishlist: (roomId) => api.delete(`/wishlist/${roomId}`),
};

export default wishlistApi;
