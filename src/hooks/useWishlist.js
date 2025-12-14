import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { wishlistService } from "../service/wishlistService";

// Fetch user's wishlist
export const useWishlistQuery = (params = {}) => {
  return useQuery({
    queryKey: ["wishlist", params],
    queryFn: () => wishlistService.fetchWishlist(params),
  });
};

// Check if a room is in wishlist
export const useCheckWishlist = (roomId) => {
  return useQuery({
    queryKey: ["wishlist", "check", roomId],
    queryFn: () => wishlistService.checkWishlist(roomId),
    enabled: !!roomId,
  });
};

// Add room to wishlist
export const useAddToWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roomId) => wishlistService.addToWishlist(roomId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });
};

// Remove room from wishlist
export const useRemoveFromWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roomId) => wishlistService.removeFromWishlist(roomId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });
};

// Toggle wishlist status
export const useToggleWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roomId) => wishlistService.toggleWishlist(roomId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });
};
