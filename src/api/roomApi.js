import api from "./axios";

const roomApi = {
  getAllRooms: (params) => api.get("/rooms", { params }),

  getFeaturedRooms: (limit = 5) =>
    api.get("/rooms/featured", { params: { limit } }),

  getPopularRooms: (city, limit = 6) =>
    api.get("/rooms/popular", { params: { city, limit } }),

  getRoomById: (id) => api.get(`/rooms/${id}`),

  createRoom: (data) => api.post("/rooms", data),

  updateRoom: (id, data) => api.put(`/rooms/${id}`, data),

  deleteRoom: (id) => api.delete(`/rooms/${id}`),

  getMyRooms: () => api.get("/rooms/user/my-rooms"),

  searchRooms: (q, page = 1) =>
    api.get("/rooms/search", { params: { q, page } }),

  getCities: () => api.get("/rooms/cities"),
};

export default roomApi;
