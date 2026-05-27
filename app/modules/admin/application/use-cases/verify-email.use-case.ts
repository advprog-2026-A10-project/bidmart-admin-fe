import type { IAuthRepository } from "~/modules/auth/domain/repositories/auth-repository.interface";
import type { VerifyEmailDTO } from "../dtos/auth.dto";

/**
 * VerifyEmailUseCase — Verifies a user's email address using a token.
 */
export class VerifyEmailUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(dto: VerifyEmailDTO): Promise<{ message: string }> {
    return this.authRepository.verifyEmail({ token: dto.token });
  }
}
