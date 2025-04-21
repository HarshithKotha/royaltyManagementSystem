import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi, describe, beforeEach, test, expect } from "vitest";
import { useNavigate, useParams } from "react-router-dom";
import { resetPassword } from "../services/AuthServices";
import ResetPassword from "../pages/ResetPassword";
import "@testing-library/jest-dom";

vi.mock("../services/AuthServices", () => ({
  resetPassword: vi.fn(),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: vi.fn(),
    useParams: vi.fn(),
  };
});

describe("ResetPassword Component", () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
    useParams.mockReturnValue({ id: "123", token: "fakeToken" });
  });

  test("renders reset password form correctly", () => {
    render(<ResetPassword />, { wrapper: MemoryRouter });

    expect(screen.getByRole("heading", { name: /Reset Password/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/New Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Reset Password/i })).toBeInTheDocument();
  });

  test("shows error when passwords do not match", async () => {
    render(<ResetPassword />, { wrapper: MemoryRouter });

    fireEvent.change(screen.getByLabelText(/New Password/i), { target: { value: "password123" } });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: "differentpass" } });
    fireEvent.click(screen.getByRole("button", { name: /Reset Password/i }));

    expect(await screen.findByText(/Passwords do not match/i)).toBeInTheDocument();
  });

  test("handles successful password reset", async () => {
    resetPassword.mockResolvedValue({ success: true, message: "Password reset successful" });

    render(<ResetPassword />, { wrapper: MemoryRouter });

    fireEvent.change(screen.getByLabelText(/New Password/i), { target: { value: "password123" } });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: /Reset Password/i }));

    await waitFor(() => {
      expect(resetPassword).toHaveBeenCalledWith("123", "fakeToken", "password123");
      expect(screen.getByText(/Password reset successful/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/login");
    }, { timeout: 2500 });
  });

  // test("handles failed password reset", async () => {
  //   resetPassword.mockRejectedValueOnce(new Error("Error resetting password")); // Fix: Ensure error has a `message` property

  //   render(<ResetPassword />, { wrapper: MemoryRouter });

  //   fireEvent.change(screen.getByLabelText(/New Password/i), { target: { value: "password123" } });
  //   fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: "password123" } });
  //   fireEvent.click(screen.getByRole("button", { name: /Reset Password/i }));

  //   await waitFor(() => {
  //     expect(resetPassword).toHaveBeenCalledWith("123", "fakeToken", "password123");
  //     expect(screen.getByText(/Error resetting password/i)).toBeInTheDocument();
  //   });
  // });
});
