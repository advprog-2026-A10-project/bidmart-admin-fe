import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { LoginForm } from "../components/login-form";

describe("LoginForm", () => {
  const mockOnSubmit = vi.fn();

  it("renders email and password fields", () => {
    render(
      <MemoryRouter>
        <LoginForm onSubmit={mockOnSubmit} />
      </MemoryRouter>,
    );
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
  });

  it("renders the sign in button", () => {
    render(
      <MemoryRouter>
        <LoginForm onSubmit={mockOnSubmit} />
      </MemoryRouter>,
    );
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("shows validation errors when submitting empty form", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <LoginForm onSubmit={mockOnSubmit} />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/password is required/i)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("shows email validation error for invalid email", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <LoginForm onSubmit={mockOnSubmit} />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText(/email/i), "not-an-email");
    await user.tab();

    expect(await screen.findByText(/valid email/i)).toBeInTheDocument();
  });

  it("calls onSubmit with correct values when form is valid", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <LoginForm onSubmit={mockOnSubmit} />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText(/email/i), "alice@example.com");
    await user.type(screen.getByLabelText("Password"), "secret123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(mockOnSubmit).toHaveBeenCalledOnce();
    expect(mockOnSubmit.mock.calls[0][0]).toEqual({
      email: "alice@example.com",
      password: "secret123",
    });
  });

  it("disables submit button when isSubmitting is true", () => {
    render(
      <MemoryRouter>
        <LoginForm onSubmit={mockOnSubmit} isSubmitting={true} />
      </MemoryRouter>,
    );
    expect(screen.getByRole("button", { name: /signing in/i })).toBeDisabled();
  });
});
