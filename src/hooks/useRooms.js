import { useQuery } from "@tanstack/react-query";
import { roomService } from "../service/roomService";

// for single rooms
export const useRoom = (roomId) => {
  return useQuery({
    queryKey: ["room", roomId],
    queryFn: () => roomService.fetchRoomById(roomId),
    enabled: !!roomId,
  });
};

//for mutilpe rooms
export const useRooms = (filters) => {
  return useQuery({
    queryKey: ["rooms", filters],
    queryFn: () => roomService.fetchAllRooms(filters),
  });
};

