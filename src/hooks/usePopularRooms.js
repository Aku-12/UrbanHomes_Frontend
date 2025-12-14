import { useQuery } from "@tanstack/react-query";
import { roomService } from "../service/roomService";

export const usePopularRooms = (city, limit = 6) => {
  return useQuery({
    queryKey: ["popularRooms", city, limit],
    queryFn: () => roomService.fetchPopularRooms(city, limit),
  });
};
