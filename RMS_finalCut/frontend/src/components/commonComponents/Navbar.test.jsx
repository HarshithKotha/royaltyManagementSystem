import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Navbar from "./Navbar";
import { useAuth } from "../../context/authContext";
import { useNotifications } from "../../context/NotificationContext";
import { useNavigate } from "react-router-dom";

// Mock `useAuth` globally
vi.mock("../../context/authContext", () => ({
  useAuth: vi.fn(() => ({
    user: { username: "testuser", email: "testuser@example.com", role: "Artist" },
    logout: vi.fn(),
  })),
}));

// Mock `useNotifications` globally
vi.mock("../../context/NotificationContext", () => ({
  useNotifications: vi.fn(() => ({
    unreadCount: 2,
    notifications: [],
    loading: false,
  })),
}));

// Mock `useNavigate` properly
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: vi.fn() };
});

// Mock `react-icons`
vi.mock("react-icons/fa", () => ({
  FaUserCircle: () => <div data-testid="user-icon">FaUserCircle</div>,
  FaBars: () => <div data-testid="menu-icon">FaBars</div>,
  FaBell: () => <div data-testid="bell-icon">FaBell</div>,
}));

describe("Navbar Component", () => {
  const mockLogout = vi.fn();
  const mockNavigate = vi.fn();
  const mockToggleSidebar = vi.fn();

  beforeEach(() => {
    useAuth.mockReturnValue({
      user: { username: "testuser", email: "testuser@example.com", role: "Artist" },
      logout: mockLogout,
    });

    useNotifications.mockReturnValue({
      unreadCount: 2,
      notifications: [],
      loading: false,
    });

    useNavigate.mockReturnValue(mockNavigate);
  });

  it("renders Navbar with user details", () => {
    render(<Navbar toggleSidebar={mockToggleSidebar} />);

    expect(screen.getByText(/Welcome, testuser/i)).toBeInTheDocument();
    expect(screen.getByTestId("menu-icon")).toBeInTheDocument();
    expect(screen.getByTestId("bell-icon")).toBeInTheDocument();
    expect(screen.getByTestId("user-icon")).toBeInTheDocument();
    expect(screen.getByText("Logout")).toBeInTheDocument();
  });

  it("toggles sidebar when the menu icon is clicked", () => {
    render(<Navbar toggleSidebar={mockToggleSidebar} />);

    fireEvent.click(screen.getByTestId("menu-icon"));
    expect(mockToggleSidebar).toHaveBeenCalledTimes(1);
  });

  it("toggles notifications dropdown when the bell icon is clicked", () => {
    render(<Navbar toggleSidebar={mockToggleSidebar} />);

    fireEvent.click(screen.getByTestId("bell-icon"));
    expect(screen.getByRole("heading", { name: /Notifications/i })).toBeInTheDocument();
    expect(screen.getByText(/No new notifications/i)).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("bell-icon"));
    expect(screen.queryByRole("heading", { name: /Notifications/i })).not.toBeInTheDocument();
  });

  it("toggles profile dropdown when the user icon is clicked", () => {
    render(<Navbar toggleSidebar={mockToggleSidebar} />);

    fireEvent.click(screen.getByTestId("user-icon"));
    expect(screen.getByRole("heading", { name: /Profile Details/i })).toBeInTheDocument();

    const profileDropdown = screen.getByRole("heading", { name: /Profile Details/i }).closest("div");
    expect(profileDropdown).toBeInTheDocument();
    expect(profileDropdown).toHaveTextContent(/Name: testuser/i);
    expect(profileDropdown).toHaveTextContent(/Email: testuser@example.com/i);
    expect(profileDropdown).toHaveTextContent(/Role: Artist/i);

    fireEvent.click(screen.getByTestId("user-icon"));
    expect(screen.queryByRole("heading", { name: /Profile Details/i })).not.toBeInTheDocument();
  });

  it("calls logout and navigates to login page when logout button is clicked", () => {
    render(<Navbar toggleSidebar={mockToggleSidebar} />);

    fireEvent.click(screen.getByText("Logout"));
    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  it("closes dropdowns when clicking outside", () => {
    render(<Navbar toggleSidebar={mockToggleSidebar} />);

    fireEvent.click(screen.getByTestId("user-icon"));
    expect(screen.getByRole("heading", { name: /Profile Details/i })).toBeInTheDocument();

    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole("heading", { name: /Profile Details/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("bell-icon"));
    expect(screen.getByRole("heading", { name: /Notifications/i })).toBeInTheDocument();

    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole("heading", { name: /Notifications/i })).not.toBeInTheDocument();
  });

  it("closes profile dropdown when notifications dropdown is opened", () => {
    render(<Navbar toggleSidebar={mockToggleSidebar} />);

    fireEvent.click(screen.getByTestId("user-icon"));
    expect(screen.getByRole("heading", { name: /Profile Details/i })).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("bell-icon"));
    expect(screen.queryByRole("heading", { name: /Profile Details/i })).not.toBeInTheDocument();
  });

  it("closes notifications dropdown when profile dropdown is opened", () => {
    render(<Navbar toggleSidebar={mockToggleSidebar} />);

    fireEvent.click(screen.getByTestId("bell-icon"));
    expect(screen.getByRole("heading", { name: /Notifications/i })).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("user-icon"));
    expect(screen.queryByRole("heading", { name: /Notifications/i })).not.toBeInTheDocument();
  });
});
