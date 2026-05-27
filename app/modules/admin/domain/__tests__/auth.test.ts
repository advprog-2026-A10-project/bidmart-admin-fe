import { describe, it, expect } from "vitest";
import { createUser, createUserId } from "../entities/user";

describe("createUserId", () => {
  it("creates a valid UserId from a non-empty string", () => {
    const id = createUserId("abc-123");
    expect(id).toBe("abc-123");
  });

  it("throws if the value is empty", () => {
    expect(() => createUserId("")).toThrow("UserId cannot be empty.");
  });

  it("throws if the value is whitespace only", () => {
    expect(() => createUserId("   ")).toThrow("UserId cannot be empty.");
  });
});

describe("createUser", () => {
  const valid = {
    id: "user-1",
    name: "Alice",
    email: "alice@example.com",
    emailVerified: false,
  };

  it("creates a valid User entity", () => {
    const user = createUser(valid);
    expect(user.id).toBe("user-1");
    expect(user.name).toBe("Alice");
    expect(user.email).toBe("alice@example.com");
    expect(user.emailVerified).toBe(false);
  });

  it("trims whitespace from name", () => {
    const user = createUser({ ...valid, name: "  Alice  " });
    expect(user.name).toBe("Alice");
  });

  it("lowercases email", () => {
    const user = createUser({ ...valid, email: "Alice@Example.COM" });
    expect(user.email).toBe("alice@example.com");
  });

  it("throws if name is empty", () => {
    expect(() => createUser({ ...valid, name: "" })).toThrow("User name cannot be empty.");
  });

  it("throws if name is whitespace only", () => {
    expect(() => createUser({ ...valid, name: "   " })).toThrow("User name cannot be empty.");
  });

  it("throws if email is missing @", () => {
    expect(() => createUser({ ...valid, email: "not-an-email" })).toThrow(
      "User email must be a valid email address.",
    );
  });
});
