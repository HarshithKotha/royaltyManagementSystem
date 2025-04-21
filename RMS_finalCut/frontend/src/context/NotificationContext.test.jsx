import React from "react";
import { render, waitFor, screen } from "@testing-library/react";
import { NotificationProvider, useNotifications } from "./NotificationContext";
import { useAuth } from "./authContext";
import axios from "axios";
import "@testing-library/jest-dom";
import { expect, describe, it, beforeEach, vi, afterEach } from "vitest";
 
// Mock dependencies
vi.mock("axios");
vi.mock("./authContext");
// Mock Child Component
const MockChild = () => {
  const { notifications, loading, markAsRead, unreadCount, sendNotification } = useNotifications();
  return (
    <div>
    <p data-testid="loading">{loading ? "Loading..." : "Loaded"}</p>
    <p data-testid="unread-count">{unreadCount}</p>
    <button onClick={() => markAsRead("notif123")}>Mark Read</button>
    <button onClick={() => sendNotification("user456", "Test Message", "info")}>Send Notification</button>
      {notifications.map((notif) => (
        <p key={notif._id}>{notif.message}</p>
      ))}
  </div>
  );
};
 
describe("NotificationContext", () => {
  const mockUser = { _id: "user123" };
  const mockUserData = { role: "artist" };
  const token = "mockToken";
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.setItem("token", token);
    useAuth.mockReturnValue({ user: mockUser, userData: mockUserData });
  });
 
  it("fetches notifications (success case)", async () => {
    const mockNotifications = [
      { _id: "notif1", message: "Notification 1", isRead: false },
      { _id: "notif2", message: "Notification 2", isRead: true },
    ];
    axios.get.mockResolvedValue({ data: { success: true, notifications: mockNotifications } });
    render(
      <NotificationProvider>
      <MockChild />
      </NotificationProvider>
    );
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));
    expect(screen.getByTestId("unread-count").textContent).toBe("0");
  });
 
  it("handles error while fetching notifications", async () => {
    axios.get.mockRejectedValue(new Error("Fetch error"));
    render(
      <NotificationProvider>
      <MockChild />
      </NotificationProvider>
    );
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));
    expect(screen.getByTestId("loading").textContent).toBe("Loading...");
  });
 
  it("does not fetch notifications if user is null", async () => {
    useAuth.mockReturnValue({ user: null, userData: null });
    render(
      <NotificationProvider>
      <MockChild />
      </NotificationProvider>
    );
    expect(axios.get).not.toHaveBeenCalled();
  });
 
  it("marks a notification as read (success case)", async () => {
    axios.put.mockResolvedValue({ data: { success: true } });
    render(
      <NotificationProvider>
      <MockChild />
      </NotificationProvider>
    );
    const markReadButton = screen.getByText("Mark Read");
    markReadButton.click();
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));
    expect(axios.put).toHaveBeenCalledWith(
      `http://localhost:5004/api/notifications/notif123`,
      { isRead: true },
      expect.any(Object)
    );
  });
 
  it("handles error when marking a notification as read", async () => {
    axios.put.mockRejectedValue(new Error("Update error"));
    render(
      <NotificationProvider>
      <MockChild />
      </NotificationProvider>
    );
    const markReadButton = screen.getByText("Mark Read");
    markReadButton.click();
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));
  });
 
  it("sends a notification successfully", async () => {
    axios.post.mockResolvedValue({ data: { success: true } });
    render(
      <NotificationProvider>
      <MockChild />
      </NotificationProvider>
    );
 
    const sendNotificationButton = screen.getByText("Send Notification");
    sendNotificationButton.click();
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
    expect(axios.post).toHaveBeenCalledWith(
      "http://localhost:5004/api/notifications/",
      { userId: "user456", message: "Test Message", type: "info" },
      expect.any(Object)
    );
  });
 
  it("handles error when sending a notification", async () => {
    axios.post.mockRejectedValue(new Error("Send error"));
    render(
      <NotificationProvider>
      <MockChild />
      </NotificationProvider>
    );
    const sendNotificationButton = screen.getByText("Send Notification");
    sendNotificationButton.click();
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
  });
 
  it("clears interval when component unmounts", async () => {
    vi.useFakeTimers();
    const setIntervalSpy = vi.spyOn(global, "setInterval");
    const clearIntervalSpy = vi.spyOn(global, "clearInterval");
    const { unmount } = render(
      <NotificationProvider>
      <MockChild />
      </NotificationProvider>
    );
    expect(setIntervalSpy).toHaveBeenCalledTimes(1);
    unmount();
    expect(clearIntervalSpy).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});
 