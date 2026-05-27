import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getAuthUseCases,
  clearCurrentUser,
} from "~/modules/auth/infrastructure/factories/auth-repository.factory";

export function useLogoutMutation() {
  return useMutation({
    mutationFn: (): Promise<void> => getAuthUseCases().logout.execute(),
    onSuccess: () => {
      clearCurrentUser();
      toast.success("Logged out successfully.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to log out.");
    },
  });
}
