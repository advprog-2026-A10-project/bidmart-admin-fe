import { getCurrentUser } from "~/modules/auth/infrastructure/factories/auth-repository.factory";
import type { UserDTO } from "~/modules/auth/application/dtos/user.dto";

/**
 * useAuthQuery — returns the currently authenticated user from the in-memory session.
 * No network request — reads from the singleton populated by useLoginMutation.
 */
export function useAuthQuery(): UserDTO | null {
  return getCurrentUser();
}
