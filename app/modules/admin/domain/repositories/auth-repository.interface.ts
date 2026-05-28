import type { User } from "../entities/user";

/**
 * IAuthRepository — Repository Interface (Port)
 *
 * Defines the contract for auth data access. Use cases depend on this
 * abstraction, not on any concrete implementation (DIP).
 * ISP: focused interface — each method has a single, clear purpose.
 */
export interface IAuthRepository {
  login(credentials: { email: string; password: string }): Promise<User>;
  register(data: { name: string; email: string; password: string }): Promise<{ message: string }>;
  verifyEmail(data: { token: string }): Promise<{ message: string }>;
  resendVerification(data: { email: string }): Promise<{ message: string }>;
  logout(): Promise<void>;
}
