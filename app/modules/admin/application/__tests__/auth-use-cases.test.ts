import { describe, it, expect, vi, beforeEach } from "vitest";
import type { MockedObject } from "vitest";
import { LoginUseCase } from "../use-cases/login.use-case";
import { RegisterUseCase } from "../use-cases/register.use-case";
import { VerifyEmailUseCase } from "../use-cases/verify-email.use-case";
import { ResendVerificationUseCase } from "../use-cases/resend-verification.use-case";
import { LogoutUseCase } from "../use-cases/logout.use-case";
import type { IAuthRepository } from "~/modules/auth/domain/repositories/auth-repository.interface";
import { createUser } from "~/modules/auth/domain/entities/user";

function createMockRepository(): MockedObject<IAuthRepository> {
  return {
    login: vi.fn(),
    register: vi.fn(),
    verifyEmail: vi.fn(),
    resendVerification: vi.fn(),
    logout: vi.fn(),
  };
}

const mockUser = createUser({
  id: "user-1",
  name: "Alice",
  email: "alice@example.com",
  emailVerified: true,
});

describe("LoginUseCase", () => {
  let repo: MockedObject<IAuthRepository>;
  let useCase: LoginUseCase;

  beforeEach(() => {
    repo = createMockRepository();
    useCase = new LoginUseCase(repo);
  });

  it("returns a UserDTO on successful login", async () => {
    repo.login.mockResolvedValue(mockUser);

    const result = await useCase.execute({ email: "alice@example.com", password: "secret" });

    expect(result.id).toBe("user-1");
    expect(result.name).toBe("Alice");
    expect(result.email).toBe("alice@example.com");
    expect(result.emailVerified).toBe(true);
    expect(repo.login).toHaveBeenCalledWith({
      email: "alice@example.com",
      password: "secret",
    });
  });

  it("propagates errors from the repository", async () => {
    repo.login.mockRejectedValue(new Error("Invalid credentials"));
    await expect(useCase.execute({ email: "x@x.com", password: "wrong" })).rejects.toThrow(
      "Invalid credentials",
    );
  });
});

describe("RegisterUseCase", () => {
  let repo: MockedObject<IAuthRepository>;
  let useCase: RegisterUseCase;

  beforeEach(() => {
    repo = createMockRepository();
    useCase = new RegisterUseCase(repo);
  });

  it("returns a message on successful registration", async () => {
    repo.register.mockResolvedValue({ message: "Check your email." });

    const result = await useCase.execute({
      name: "Alice",
      email: "alice@example.com",
      password: "secret123",
    });

    expect(result.message).toBe("Check your email.");
    expect(repo.register).toHaveBeenCalledWith({
      name: "Alice",
      email: "alice@example.com",
      password: "secret123",
    });
  });
});

describe("VerifyEmailUseCase", () => {
  let repo: MockedObject<IAuthRepository>;
  let useCase: VerifyEmailUseCase;

  beforeEach(() => {
    repo = createMockRepository();
    useCase = new VerifyEmailUseCase(repo);
  });

  it("returns a message on successful verification", async () => {
    repo.verifyEmail.mockResolvedValue({ message: "Email verified." });

    const result = await useCase.execute({ token: "abc123" });

    expect(result.message).toBe("Email verified.");
    expect(repo.verifyEmail).toHaveBeenCalledWith({ token: "abc123" });
  });

  it("propagates errors from the repository", async () => {
    repo.verifyEmail.mockRejectedValue(new Error("Token expired"));
    await expect(useCase.execute({ token: "expired" })).rejects.toThrow("Token expired");
  });
});

describe("ResendVerificationUseCase", () => {
  let repo: MockedObject<IAuthRepository>;
  let useCase: ResendVerificationUseCase;

  beforeEach(() => {
    repo = createMockRepository();
    useCase = new ResendVerificationUseCase(repo);
  });

  it("returns a message on success", async () => {
    repo.resendVerification.mockResolvedValue({ message: "Sent." });

    const result = await useCase.execute({ email: "alice@example.com" });

    expect(result.message).toBe("Sent.");
    expect(repo.resendVerification).toHaveBeenCalledWith({ email: "alice@example.com" });
  });
});

describe("LogoutUseCase", () => {
  let repo: MockedObject<IAuthRepository>;
  let useCase: LogoutUseCase;

  beforeEach(() => {
    repo = createMockRepository();
    useCase = new LogoutUseCase(repo);
  });

  it("calls repository logout", async () => {
    repo.logout.mockResolvedValue();

    await useCase.execute();

    expect(repo.logout).toHaveBeenCalledOnce();
  });
});
