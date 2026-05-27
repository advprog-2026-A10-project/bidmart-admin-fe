import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { RegisterForm } from "../components/register-form";

describe("RegisterForm", () => {
  const mockOnSubmit = vi.fn();

  it("renders all fields", () => {
    render(
      <MemoryRouter>
        <RegisterForm onSubmit={mockOnSubmit} />
      </MemoryRouter>,
    );
    expect(screen.getByLabelText(/^name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
  });

  it("shows validation errors when submitting empty form", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <RegisterForm onSubmit={mockOnSubmit} />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/password must be at least/i)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("shows error when passwords do not match", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <RegisterForm onSubmit={mockOnSubmit} />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText(/^name/i), "Alice");
    await user.type(screen.getByLabelText(/^email/i), "alice@example.com");
    await user.type(screen.getByLabelText(/^password/i), "secret123");
    await user.type(screen.getByLabelText(/confirm password/i), "different");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("calls onSubmit with correct values when form is valid", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <RegisterForm onSubmit={mockOnSubmit} />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText(/^name/i), "Alice");
    await user.type(screen.getByLabelText(/^email/i), "alice@example.com");
    await user.type(screen.getByLabelText(/^password/i), "secret123");
    await user.type(screen.getByLabelText(/confirm password/i), "secret123");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(mockOnSubmit).toHaveBeenCalledOnce();
    expect(mockOnSubmit.mock.calls[0][0]).toEqual({
      name: "Alice",
      email: "alice@example.com",
      password: "secret123",
      confirmPassword: "secret123",
    });
  });

  it("disables submit button when isSubmitting is true", () => {
    render(
      <MemoryRouter>
        <RegisterForm onSubmit={mockOnSubmit} isSubmitting={true} />
      </MemoryRouter>,
    );
    expect(screen.getByRole("button", { name: /creating account/i })).toBeDisabled();
  });
});
