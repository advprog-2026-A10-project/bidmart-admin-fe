import type { IAuthRepository } from "~/modules/auth/domain/repositories/auth-repository.interface";
import type { RegisterDTO } from "../dtos/auth.dto";

/**
 * RegisterUseCase — Registers a new user account.
 * Returns a message (e.g. "Check your email to verify your account.").
 */
export class RegisterUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(dto: RegisterDTO): Promise<{ message: string }> {
    return this.authRepository.register({
      name: dto.name,
      email: dto.email,
      password: dto.password,
    });
  }
}
