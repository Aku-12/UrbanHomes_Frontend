import { useQuery } from "@tanstack/react-query";
import { roomService } from "../service/roomService";

export const useFeaturedRooms = (limit = 5) => {
  return useQuery({
    queryKey: ["featuredRooms", limit],
    queryFn: () => roomService.fetchFeaturedRooms(limit),
  });
};
