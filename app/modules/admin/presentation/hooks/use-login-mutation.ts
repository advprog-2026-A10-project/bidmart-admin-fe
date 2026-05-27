import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getAuthUseCases,
  setCurrentUser,
} from "~/modules/auth/infrastructure/factories/auth-repository.factory";
import type { LoginDTO } from "~/modules/auth/application/dtos/auth.dto";
import type { UserDTO } from "~/modules/auth/application/dtos/user.dto";

export function useLoginMutation() {
  return useMutation({
    mutationFn: (dto: LoginDTO): Promise<UserDTO> => getAuthUseCases().login.execute(dto),
    onSuccess: (user) => {
      setCurrentUser(user);
      toast.success("Logged in successfully.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to log in.");
    },
  });
}
