import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { getAuthUseCases } from "~/modules/auth/infrastructure/factories/auth-repository.factory";
import type { RegisterDTO } from "~/modules/auth/application/dtos/auth.dto";

export function useRegisterMutation() {
  return useMutation({
    mutationFn: (dto: RegisterDTO): Promise<{ message: string }> =>
      getAuthUseCases().register.execute(dto),
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create account.");
    },
  });
}
