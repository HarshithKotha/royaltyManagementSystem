import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import CollaborationRequests from "./CollaborationRequests";
import { useAuth } from "../../../context/authContext";
import { useNotifications } from "../../../context/NotificationContext";
import {
  fetchCollaborationRequests,
  handleCollaborationRequest,
} from "../../../services/CollaborationService";
import "@testing-library/jest-dom/vitest";

vi.mock("../../../context/authContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../../../context/NotificationContext", () => ({
  useNotifications: vi.fn(),
}));

vi.mock("../../../services/CollaborationService", () => ({
  fetchCollaborationRequests: vi.fn(),
  handleCollaborationRequest: vi.fn(),
}));

describe("CollaborationRequests Component", () => {
  let sendNotificationMock;

  beforeEach(() => {
    vi.clearAllMocks();
    sendNotificationMock = vi.fn();
    useAuth.mockReturnValue({ userData: { _id: "manager123", fullName: "Test Manager" } });
    useNotifications.mockReturnValue({ sendNotification: sendNotificationMock });
  });

  it("renders 'No collaboration requests found' when there are no requests", async () => {
    fetchCollaborationRequests.mockResolvedValue([]);

    render(<CollaborationRequests />);

    await waitFor(() => {
      expect(screen.getByText("No collaboration requests found.")).toBeInTheDocument();
    });
  });

  it("handles accept request correctly", async () => {
    fetchCollaborationRequests.mockResolvedValue([
      {
        _id: "req1",
        status: "Pending",
        artistId: { artistId: "artist123", fullName: "Artist One", email: "artist1@example.com", mobileNo: "1234567890" },
      },
    ]);
    handleCollaborationRequest.mockResolvedValue({});

    render(<CollaborationRequests />);

    await waitFor(() => {
      expect(screen.getByText("Artist One")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Accept"));

    await waitFor(() => {
      expect(handleCollaborationRequest).toHaveBeenCalledWith("req1", "Approved");
      expect(sendNotificationMock).toHaveBeenCalledWith(
        "artist123",
        "Your collaboration has been Approved by Test Manager.",
        "collaborationRequest"
      );
    });
  });

  it("handles reject request correctly", async () => {
    fetchCollaborationRequests.mockResolvedValue([
      {
        _id: "req1",
        status: "Pending",
        artistId: { artistId: "artist123", fullName: "Artist One", email: "artist1@example.com", mobileNo: "1234567890" },
      },
    ]);
    handleCollaborationRequest.mockResolvedValue({});

    render(<CollaborationRequests />);

    await waitFor(() => {
      expect(screen.getByText("Artist One")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Reject"));

    await waitFor(() => {
      expect(handleCollaborationRequest).toHaveBeenCalledWith("req1", "Rejected");
      expect(sendNotificationMock).toHaveBeenCalledWith(
        "artist123",
        "Your collaboration has been Rejected by Test Manager.",
        "collaborationRequest"
      );
    });
  });

  it("does not fetch requests when userData is missing", async () => {
    useAuth.mockReturnValue({ userData: null });

    render(<CollaborationRequests />);

    expect(fetchCollaborationRequests).not.toHaveBeenCalled();
  });

  it("logs an error when fetching requests fails", async () => {
    const consoleErrorMock = vi.spyOn(console, "error").mockImplementation(() => {});
    fetchCollaborationRequests.mockRejectedValue(new Error("Network Error"));

    render(<CollaborationRequests />);
    
    await waitFor(() => {
      expect(consoleErrorMock).toHaveBeenCalledWith("Error fetching requests:", expect.any(Error));
    });

    consoleErrorMock.mockRestore();
  });

  it("removes a request from UI after acceptance", async () => {
    fetchCollaborationRequests.mockResolvedValue([
      {
        _id: "request1",
        status: "Pending",
        artistId: { artistId: "artist123", fullName: "Artist One", email: "artist1@example.com" },
      },
    ]);

    render(<CollaborationRequests />);

    await waitFor(() => expect(screen.getByText("Artist One")).toBeInTheDocument());

    fireEvent.click(screen.getByText("Accept"));

    await waitFor(() => expect(screen.queryByText("Artist One")).not.toBeInTheDocument());
  });
});