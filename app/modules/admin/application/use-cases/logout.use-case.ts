import type { IAuthRepository } from "~/modules/auth/domain/repositories/auth-repository.interface";

/**
 * LogoutUseCase — Logs out the currently authenticated user.
 */
export class LogoutUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(): Promise<void> {
    return this.authRepository.logout();
  }
}
