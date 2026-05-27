/**
 * User — Domain Entity
 *
 * Represents an authenticated user in the domain. Pure TypeScript type with
 * no framework or infrastructure dependencies (DIP, SRP).
 */
export type User = {
  readonly id: UserId;
  readonly name: string;
  readonly email: string;
  readonly emailVerified: boolean;
};

/**
 * UserId — branded string type enforcing type safety at boundaries.
 * Prevents accidentally passing a generic string where a UserId is expected.
 */
export type UserId = string & { readonly __brand: "UserId" };

/**
 * Factory for creating a validated UserId value object.
 */
export function createUserId(value: string): UserId {
  if (!value || value.trim().length === 0) {
    throw new Error("UserId cannot be empty.");
  }
  return value as UserId;
}

/**
 * Factory for creating a User entity with validation.
 */
export function createUser(params: {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
}): User {
  if (!params.name || params.name.trim().length === 0) {
    throw new Error("User name cannot be empty.");
  }
  if (!params.email || !params.email.includes("@")) {
    throw new Error("User email must be a valid email address.");
  }
  return {
    id: createUserId(params.id),
    name: params.name.trim(),
    email: params.email.trim().toLowerCase(),
    emailVerified: params.emailVerified,
  };
}
