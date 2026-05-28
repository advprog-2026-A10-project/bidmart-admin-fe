import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { getAuthUseCases } from "~/modules/auth/infrastructure/factories/auth-repository.factory";
import type { ResendVerificationDTO } from "~/modules/auth/application/dtos/auth.dto";

export function useResendVerificationMutation() {
  return useMutation({
    mutationFn: (dto: ResendVerificationDTO): Promise<{ message: string }> =>
      getAuthUseCases().resendVerification.execute(dto),
    onSuccess: () => {
      toast.success("Verification email sent. Please check your inbox.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to resend verification email.");
    },
  });
}
