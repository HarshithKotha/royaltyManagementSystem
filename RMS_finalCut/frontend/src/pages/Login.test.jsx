import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Login from "../pages/Login";
import { useAuth } from "../context/authContext";
import { vi } from "vitest";
import { loginUser } from "../services/AuthServices";
import "@testing-library/jest-dom";

vi.mock("../context/authContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../services/AuthServices", () => ({
  loginUser: vi.fn(),
}));

describe("Login Component", () => {
  beforeEach(() => {
    useAuth.mockReturnValue({ login: vi.fn() });
    sessionStorage.clear();
  });

  test("renders login form correctly", () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    
    expect(screen.getByRole("heading", { level: 2, name: "Login" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument();
  });


  test("handles successful login and navigates based on role", async () => {
    const mockLogin = vi.fn();
    useAuth.mockReturnValue({ login: mockLogin });
    loginUser.mockResolvedValue({
      success: true,
      token: "test-token",
      user: { role: "Manager" },
    });

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("Enter Email"), {
      target: { value: "manager@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("*******"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(sessionStorage.getItem("token")).toBe("test-token");
      expect(mockLogin).toHaveBeenCalledWith(
        { role: "Manager" },
        "test-token"
      );
      expect(window.location.pathname).toBe("/manager-dashboard");
    });
  });

  test("handles first-time login scenario", async () => {
    loginUser.mockResolvedValue({
      loginStatus: { status: "first time login" },
      user: { _id: "123" },
      token: "first-login-token",
    });

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("Enter Email"), {
      target: { value: "newuser@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("*******"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(window.location.pathname).toBe("/reset-password/123/first-login-token");
    });
  });

  test("displays error message on login failure", async () => {
    loginUser.mockRejectedValue("Invalid credentials");

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("Enter Email"), {
      target: { value: "wrong@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("*******"), {
      target: { value: "wrongpassword" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
    });
  });

  test("navigates to forgot password page", async () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText("Forgot Password"));

    await waitFor(() => {
      expect(window.location.pathname).toBe("/forgot-password");
    });
  });

  test("password input type is correct", () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    
    const passwordInput = screen.getByPlaceholderText("*******");
    expect(passwordInput).toHaveAttribute("type", "password");
  });
});
