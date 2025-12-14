import { useMutation, useQueryClient } from "@tanstack/react-query";
import { roomService } from "../service/roomService";

export const useUpdateRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => roomService.updateRoom(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["rooms"]);
      queryClient.invalidateQueries(["room"]);
      queryClient.invalidateQueries(["myRooms"]);
    },
  });
};
