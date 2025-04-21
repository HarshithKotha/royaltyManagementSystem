import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ViewMyManager from "./ViewMyManager";
import "@testing-library/jest-dom";
import { useAuth } from "../../../context/authContext";
import { useNotifications } from "../../../context/NotificationContext";
import { cancelCollaboration, fetchCollaborationsByUserAndRole } from "../../../services/CollaborationService";
import { expect, describe, test, beforeEach, vi } from "vitest";

// Mocking useAuth hook

vi.mock("../../../context/authContext", () => ({
  useAuth: vi.fn(),
}));

// Mocking useNotifications hook

vi.mock("../../../context/NotificationContext", () => ({
  useNotifications: vi.fn(),
}));

// Mocking CollaborationService

vi.mock("../../../services/CollaborationService", () => ({
  cancelCollaboration: vi.fn(),
  fetchCollaborationsByUserAndRole: vi.fn(),
}));

describe("ViewMyManager Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({
      userData: {
        _id: "artist123",
        fullName: "John Doe",
        manager: {
          fullName: "Jane Smith",
          email: "jane@example.com",
          mobileNo: "1234567890",
          address: "123 Manager St",
          commissionPercentage: 10,
          managedArtists: [{}],
          description: "Experienced manager",
          managerId: "manager123",
        },
      },
    });

    useNotifications.mockReturnValue({
      sendNotification: vi.fn(),
    });

  });

  test("renders manager details correctly", async () => {
    render(<ViewMyManager />);
    expect(await screen.findByText("Manager Details")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
    expect(screen.getByText("1234567890")).toBeInTheDocument();
  });

  test("renders 'No manager assigned' message when no manager exists", async () => {
    useAuth.mockReturnValueOnce({ userData: { _id: "artist123" } });
    render(<ViewMyManager />);
    expect(screen.getByText("No manager assigned.")).toBeInTheDocument();
  });

  test("clicking 'Cancel Collaboration' shows reason box", async () => {
    useAuth.mockReturnValueOnce({
      userData: {
        _id: "artist123",
        fullName: "Test Artist",
        manager: {
          fullName: "Jane Smith",
          email: "jane@example.com",
          mobileNo: "1234567890",
          address: "123 Manager St",
          commissionPercentage: 10,
          managedArtists: [{}],
          managerId: "manager123",
        },

      },

    });

    fetchCollaborationsByUserAndRole.mockResolvedValueOnce([
      { _id: "collab123", status: "Approved" },
    ]);

    render(<ViewMyManager />);

    // Wait for the button to appear

    const cancelButton = await screen.findByRole("button", {
      name: /cancel collaboration/i,
    });

    fireEvent.click(cancelButton);

    // Ensure the reason box appears

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText("Enter reason for cancellation...")
      ).toBeInTheDocument();

    });

  });

  test("clicking outside the reason box closes it", async () => {
    useAuth.mockReturnValueOnce({

      userData: {
        _id: "artist123",
        fullName: "Test Artist",
        manager: {
          fullName: "Jane Smith",
          email: "jane@example.com",
          mobileNo: "1234567890",
          address: "123 Manager St",
          commissionPercentage: 10,
          managedArtists: [{}],
          managerId: "manager123",

        },

      },

    });

    fetchCollaborationsByUserAndRole.mockResolvedValueOnce([
      { _id: "collab123", status: "Approved" },
    ]);
    render(<ViewMyManager />);

    // Wait for the button to appear

    const cancelButton = await screen.findByRole("button", {
      name: /cancel collaboration/i,
    });
    fireEvent.click(cancelButton);

    // Ensure the reason box appears

    expect(
      screen.getByPlaceholderText("Enter reason for cancellation...")
    ).toBeInTheDocument();

    // Simulate clicking outside the reason box

    fireEvent.mouseDown(document.body);

    // Ensure the reason box disappears

    await waitFor(() => {
      expect(
        screen.queryByPlaceholderText("Enter reason for cancellation...")
      ).not.toBeInTheDocument();

    });

  });

  test("submitting cancel request calls API and updates UI", async () => {

    // Create spy functions first
    const sendNotificationMock = vi.fn();

    // Setup the mocks to return the expected values

    useNotifications.mockReturnValue({ sendNotification: sendNotificationMock });
    fetchCollaborationsByUserAndRole.mockResolvedValue([{ _id: "collab123", status: "Approved" }]);
    cancelCollaboration.mockResolvedValue({ success: true });
    render(<ViewMyManager />);
    // Wait for component to fetch collaborations

    await waitFor(() => expect(fetchCollaborationsByUserAndRole).toHaveBeenCalled());
    // Find and click the cancel button

    const cancelButton = await screen.findByText("Cancel Collaboration");
    fireEvent.click(cancelButton);
    // Enter cancellation reason

    const reasonInput = screen.getByPlaceholderText("Enter reason for cancellation...");
    fireEvent.change(reasonInput, { target: { value: "Not satisfied" } });
    // Submit the cancellation request
    const submitButton = screen.getByText("Submit Request");
    fireEvent.click(submitButton);

    // Wait for API calls to complete

    await waitFor(() => {
      expect(cancelCollaboration).toHaveBeenCalledWith("collab123", "Not satisfied");
    });

    // Now check if sendNotification was called
    await waitFor(() => {
      expect(sendNotificationMock).toHaveBeenCalled();
    });
    // Verify UI update
    expect(screen.getByText("Request sent for cancellation.")).toBeInTheDocument();
  });

});
