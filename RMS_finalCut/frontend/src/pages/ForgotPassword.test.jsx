import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { forgotPassword } from "../services/AuthServices";
import ForgotPassword from "../pages/ForgotPassword";
import "@testing-library/jest-dom";
import { describe, it, vi, beforeEach, expect } from "vitest";

// Mock forgotPassword service
vi.mock("../services/AuthServices", () => ({
  forgotPassword: vi.fn(),
}));

// Mock useNavigate from react-router-dom
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

describe("ForgotPassword Component", () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
  });

  it("renders Forgot Password form correctly", () => {
    render(<ForgotPassword />, { wrapper: MemoryRouter });

    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Send Reset Link/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Back to Login/i })
    ).toBeInTheDocument();
  });

  it("handles successful password reset request", async () => {
    forgotPassword.mockResolvedValue({ success: true });

    render(<ForgotPassword />, { wrapper: MemoryRouter });

    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Send Reset Link/i }));

    await waitFor(() => {
      expect(screen.queryByText(/password reset email sent/i)).not.toBeNull();
    });
  });

  it("navigates back to login page when 'Back to Login' is clicked", () => {
    render(<ForgotPassword />, { wrapper: MemoryRouter });

    fireEvent.click(screen.getByRole("button", { name: /Back to Login/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });
});
