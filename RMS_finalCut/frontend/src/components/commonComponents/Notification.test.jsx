import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Notifications from "./Notification";
import { useNotifications } from "../../context/NotificationContext";

// Mock the useNotifications hook
vi.mock("../../context/NotificationContext", () => ({
  useNotifications: vi.fn(),
}));

describe("Notifications Component", () => {
  const mockMarkAsRead = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state when notifications are loading", () => {
    // Mock the loading state
    useNotifications.mockReturnValue({
      notifications: [],
      loading: true,
      markAsRead: mockMarkAsRead,
    });

    render(<Notifications />);

    // Check if the loading message is displayed
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  });

  it("renders no notifications message when there are no notifications", () => {
    // Mock the empty notifications state
    useNotifications.mockReturnValue({
      notifications: [],
      loading: false,
      markAsRead: mockMarkAsRead,
    });

    render(<Notifications />);

    // Check if the "No new notifications" message is displayed
    expect(screen.getByText(/No new notifications/i)).toBeInTheDocument();
  });

  it("renders notifications when notifications are available", () => {
    // Mock the notifications state with some data
    useNotifications.mockReturnValue({
      notifications: [
        { _id: "1", message: "Test notification 1" },
        { _id: "2", message: "Test notification 2" },
      ],
      loading: false,
      markAsRead: mockMarkAsRead,
    });

    render(<Notifications />);

    // Check if the notifications are displayed
    expect(screen.getByText(/Test notification 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Test notification 2/i)).toBeInTheDocument();

    // Check if the "Mark as Read" buttons are displayed
    const markAsReadButtons = screen.getAllByText(/Mark as Read/i);
    expect(markAsReadButtons).toHaveLength(2);
  });

  it("calls markAsRead when the 'Mark as Read' button is clicked", () => {
    // Mock the notifications state with some data
    useNotifications.mockReturnValue({
      notifications: [{ _id: "1", message: "Test notification 1" }],
      loading: false,
      markAsRead: mockMarkAsRead,
    });

    render(<Notifications />);

    // Simulate clicking the "Mark as Read" button
    const markAsReadButton = screen.getByText(/Mark as Read/i);
    fireEvent.click(markAsReadButton);

    // Check if the markAsRead function was called with the correct ID
    expect(mockMarkAsRead).toHaveBeenCalledTimes(1);
    expect(mockMarkAsRead).toHaveBeenCalledWith("1");
  });
});
