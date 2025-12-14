import { useMutation, useQueryClient } from "@tanstack/react-query";
import { roomService } from "../service/roomService";

export const useCreateRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: roomService.createRoom,
    onSuccess: () => {
      queryClient.invalidateQueries(["rooms"]);
      queryClient.invalidateQueries(["myRooms"]);
    },
  });
};


