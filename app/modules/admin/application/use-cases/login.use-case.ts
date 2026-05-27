import type { IAuthRepository } from "~/modules/auth/domain/repositories/auth-repository.interface";
import type { LoginDTO } from "../dtos/auth.dto";
import type { UserDTO } from "../dtos/user.dto";

/**
 * LoginUseCase — Authenticates a user with email and password.
 * Returns a UserDTO representing the authenticated user.
 */
export class LoginUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(dto: LoginDTO): Promise<UserDTO> {
    const user = await this.authRepository.login({
      email: dto.email,
      password: dto.password,
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
    };
  }
}
