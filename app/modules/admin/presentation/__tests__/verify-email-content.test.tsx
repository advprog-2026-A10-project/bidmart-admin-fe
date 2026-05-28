import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { VerifyEmailContent } from "../components/verify-email-content";
import * as factory from "~/modules/auth/infrastructure/factories/auth-repository.factory";

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("VerifyEmailContent — no token", () => {
  it("shows 'check your inbox' copy when no token is provided", () => {
    renderWithProviders(<VerifyEmailContent />);
    expect(screen.getByText(/verification link/i)).toBeInTheDocument();
  });

  it("renders the resend form with email field", () => {
    renderWithProviders(<VerifyEmailContent />);
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /resend verification/i })).toBeInTheDocument();
  });

  it("pre-fills email when email prop is provided", () => {
    renderWithProviders(<VerifyEmailContent email="alice@example.com" />);
    expect(screen.getByLabelText(/email address/i)).toHaveValue("alice@example.com");
  });

  it("shows validation error when resend is submitted with empty email", async () => {
    const user = userEvent.setup();
    renderWithProviders(<VerifyEmailContent />);

    await user.click(screen.getByRole("button", { name: /resend verification/i }));

    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
  });
});

describe("VerifyEmailContent — with token", () => {
  beforeEach(() => {
    vi.spyOn(factory, "getAuthUseCases").mockReturnValue({
      login: { execute: vi.fn() } as never,
      register: { execute: vi.fn() } as never,
      verifyEmail: { execute: vi.fn().mockResolvedValue({ message: "Email verified!" }) } as never,
      resendVerification: { execute: vi.fn() } as never,
      logout: { execute: vi.fn() } as never,
    });
  });

  it("shows a spinner while verifying", async () => {
    // Make the promise hang to observe the pending state
    vi.spyOn(factory, "getAuthUseCases").mockReturnValue({
      login: { execute: vi.fn() } as never,
      register: { execute: vi.fn() } as never,
      verifyEmail: {
        execute: vi.fn().mockReturnValue(new Promise(() => {})),
      } as never,
      resendVerification: { execute: vi.fn() } as never,
      logout: { execute: vi.fn() } as never,
    });

    renderWithProviders(<VerifyEmailContent token="abc123" />);

    expect(await screen.findByRole("status")).toBeInTheDocument();
  });

  it("shows success message after verification", async () => {
    renderWithProviders(<VerifyEmailContent token="abc123" />);

    expect(await screen.findByText(/email verified/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /continue to sign in/i })).toBeInTheDocument();
  });

  it("shows error message when verification fails", async () => {
    vi.spyOn(factory, "getAuthUseCases").mockReturnValue({
      login: { execute: vi.fn() } as never,
      register: { execute: vi.fn() } as never,
      verifyEmail: {
        execute: vi.fn().mockRejectedValue(new Error("Token expired.")),
      } as never,
      resendVerification: { execute: vi.fn() } as never,
      logout: { execute: vi.fn() } as never,
    });

    renderWithProviders(<VerifyEmailContent token="bad-token" />);

    await waitFor(() => {
      expect(screen.getByText(/token expired/i)).toBeInTheDocument();
    });
  });
});
