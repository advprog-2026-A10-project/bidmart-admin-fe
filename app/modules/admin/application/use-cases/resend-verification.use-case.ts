import type { IAuthRepository } from "~/modules/auth/domain/repositories/auth-repository.interface";
import type { ResendVerificationDTO } from "../dtos/auth.dto";

/**
 * ResendVerificationUseCase — Re-sends the email verification link to a user.
 */
export class ResendVerificationUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(dto: ResendVerificationDTO): Promise<{ message: string }> {
    return this.authRepository.resendVerification({ email: dto.email });
  }
}
