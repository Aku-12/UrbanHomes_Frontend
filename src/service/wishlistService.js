import wishlistApi from "../api/wishlistApi";

export const wishlistService = {
  async fetchWishlist(params = {}) {
    const res = await wishlistApi.getWishlist(params);
    return res.data;
  },

  async addToWishlist(roomId) {
    const res = await wishlistApi.addToWishlist(roomId);
    return res.data;
  },

  async toggleWishlist(roomId) {
    const res = await wishlistApi.toggleWishlist(roomId);
    return res.data;
  },

  async checkWishlist(roomId) {
    const res = await wishlistApi.checkWishlist(roomId);
    return res.data;
  },

  async removeFromWishlist(roomId) {
    const res = await wishlistApi.removeFromWishlist(roomId);
    return res.data;
  },
};
