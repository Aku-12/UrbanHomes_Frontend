import roomApi from "../api/roomApi";

export const roomService = {
  async fetchAllRooms(filters) {
    const res = await roomApi.getAllRooms(filters);
    return res.data;
  },

  async fetchFeaturedRooms(limit = 5) {
    const res = await roomApi.getFeaturedRooms(limit);
    return res.data.rooms;
  },

  async fetchPopularRooms(city, limit = 6) {
    const res = await roomApi.getPopularRooms(city, limit);
    return res.data.rooms;
  },

  async fetchRoomById(id) {
    const res = await roomApi.getRoomById(id);
    return res.data.room;
  },

  async createRoom(roomData) {
    const res = await roomApi.createRoom(roomData);
    return res.data.room;
  },

  async updateRoom(id, roomData) {
    const res = await roomApi.updateRoom(id, roomData);
    return res.data.room;
  },

  async deleteRoom(id) {
    const res = await roomApi.deleteRoom(id);
    return res.data;
  },

  async fetchMyRooms() {
    const res = await roomApi.getMyRooms();
    return res.data.rooms;
  },

  async searchRooms(query) {
    const res = await roomApi.searchRooms(query);
    return res.data.rooms;
  },

  async fetchCities() {
    const res = await roomApi.getCities();
    return res.data.cities;
  },
};
