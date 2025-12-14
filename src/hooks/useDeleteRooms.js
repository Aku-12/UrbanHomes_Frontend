import { useMutation, useQueryClient } from "@tanstack/react-query";
import { roomService } from "../service/roomService";

export const useDeleteRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => roomService.deleteRoom(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["rooms"]);
      queryClient.invalidateQueries(["myRooms"]);
    },
  });
};
