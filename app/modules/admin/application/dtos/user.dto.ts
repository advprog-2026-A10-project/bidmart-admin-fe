import type { UserId } from "~/modules/auth/domain/entities/user";

/**
 * UserDTO — Data Transfer Object for presenting user data to the UI layer.
 * Decouples the domain entity shape from what the presentation layer consumes.
 */
export type UserDTO = {
  id: UserId;
  name: string;
  email: string;
  emailVerified: boolean;
};
