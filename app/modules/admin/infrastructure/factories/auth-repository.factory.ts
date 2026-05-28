import { AuthApiRepository } from "../repositories/auth-api.repository";
import { LoginUseCase } from "~/modules/auth/application/use-cases/login.use-case";
import { RegisterUseCase } from "~/modules/auth/application/use-cases/register.use-case";
import { VerifyEmailUseCase } from "~/modules/auth/application/use-cases/verify-email.use-case";
import { ResendVerificationUseCase } from "~/modules/auth/application/use-cases/resend-verification.use-case";
import { LogoutUseCase } from "~/modules/auth/application/use-cases/logout.use-case";
import type { UserDTO } from "~/modules/auth/application/dtos/user.dto";

/**
 * AuthUseCaseFactory — wires up the dependency graph for the auth module.
 *
 * Factory pattern: centralises construction so that swap-ins (e.g. mock repos in tests)
 * only require changing this one place. Use cases are unaware of which concrete
 * repository implementation they receive (DIP satisfied).
 */
export type AuthUseCases = {
  login: LoginUseCase;
  register: RegisterUseCase;
  verifyEmail: VerifyEmailUseCase;
  resendVerification: ResendVerificationUseCase;
  logout: LogoutUseCase;
};

export function createAuthUseCases(): AuthUseCases {
  const authRepository = new AuthApiRepository();

  return {
    login: new LoginUseCase(authRepository),
    register: new RegisterUseCase(authRepository),
    verifyEmail: new VerifyEmailUseCase(authRepository),
    resendVerification: new ResendVerificationUseCase(authRepository),
    logout: new LogoutUseCase(authRepository),
  };
}

// Singleton for client-side usage (avoids re-creating on every render)
let _authUseCases: AuthUseCases | undefined;

export function getAuthUseCases(): AuthUseCases {
  if (!_authUseCases) {
    _authUseCases = createAuthUseCases();
  }
  return _authUseCases;
}

// In-memory auth session (cleared on logout; persisted server-side via httpOnly cookie)
let _currentUser: UserDTO | null = null;

export function setCurrentUser(user: UserDTO): void {
  _currentUser = user;
}

export function getCurrentUser(): UserDTO | null {
  return _currentUser;
}

export function clearCurrentUser(): void {
  _currentUser = null;
}
