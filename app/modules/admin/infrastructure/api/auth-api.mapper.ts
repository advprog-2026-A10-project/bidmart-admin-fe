import { createUser } from "~/modules/auth/domain/entities/user";
import type { User } from "~/modules/auth/domain/entities/user";
import type { UserApiResponse } from "./schemas";

/**
 * AuthApiMapper — maps raw API response objects to domain entities.
 *
 * SRP: single responsibility — translation between API shape and domain shape.
 */
export class AuthApiMapper {
  static toDomain(raw: UserApiResponse): User {
    return createUser({
      id: raw.id,
      name: raw.name,
      email: raw.email,
      emailVerified: raw.emailVerified,
    });
  }
}
