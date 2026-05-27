import { useMutation } from "@tanstack/react-query";
import { getAuthUseCases } from "~/modules/auth/infrastructure/factories/auth-repository.factory";
import type { VerifyEmailDTO } from "~/modules/auth/application/dtos/auth.dto";

export function useVerifyEmailMutation() {
  return useMutation({
    mutationFn: (dto: VerifyEmailDTO): Promise<{ message: string }> =>
      getAuthUseCases().verifyEmail.execute(dto),
  });
}
