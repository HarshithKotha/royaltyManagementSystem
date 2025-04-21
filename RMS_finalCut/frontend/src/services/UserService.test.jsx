import axios from "axios";
import { 
  createUser, 
  fetchUserDetails, 
  updateUserProfile, 
  fetchUsersByRole, 
  toggleUserStatus 
} from "./userService";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
 
vi.mock("axios");
 
describe("UserService API Tests", () => {
  const mockUser = {
    username: "testUser",
    role: "manager",
    email: "test@example.com",
  };
 
  const headers = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer fake_token`,
    },
  };
 
  beforeEach(() => {
    sessionStorage.setItem("token", "fake_token");
  });
 
  afterEach(() => {
    vi.clearAllMocks();
  });
 
  // Test createUser success
  it("should create a user successfully", async () => {
    axios.post.mockResolvedValueOnce({ data: { success: true, user: mockUser } });
 
    const result = await createUser(mockUser);
 
    expect(result).toEqual({ success: true, user: mockUser });
    expect(axios.post).toHaveBeenCalledWith("http://localhost:5005/api/users", expect.any(Object), headers);
  });
 
  // Test createUser failure - API error
  it("should throw an error when createUser fails due to API error", async () => {
    axios.post.mockRejectedValueOnce({ response: { data: { message: "User creation failed" } } });
 
    await expect(createUser(mockUser)).rejects.toThrow("User creation failed");
  });
 
  // Test createUser failure - Network error
  it("should throw a generic error when createUser fails due to network issue", async () => {
    axios.post.mockRejectedValueOnce(new Error("Network Error"));
 
    await expect(createUser(mockUser)).rejects.toThrow("Failed to create user");
  });
 
  // Test fetchUserDetails success
  it("should fetch user details successfully", async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, user: mockUser } });
 
    const result = await fetchUserDetails("testUser");
 
    expect(result).toEqual(mockUser);
    expect(axios.get).toHaveBeenCalledWith("http://localhost:5005/api/users/testUser", headers);
  });
 
  // Test fetchUserDetails failure - Network issue
  it("should throw a generic error when fetchUserDetails fails due to network issue", async () => {
    axios.get.mockRejectedValueOnce(new Error("Request timeout"));
 
    await expect(fetchUserDetails("testUser")).rejects.toThrow("Failed to fetch user details");
  });
 
  // Test updateUserProfile success
  it("should update user profile successfully", async () => {
    axios.put.mockResolvedValueOnce({ data: { success: true, user: mockUser } });
 
    const result = await updateUserProfile("testUser", mockUser);
 
    expect(result).toEqual({ success: true, user: mockUser });
    expect(axios.put).toHaveBeenCalledWith("http://localhost:5005/api/users/testUser", mockUser, headers);
  });
 
  // Test fetchUsersByRole success
  it("should fetch users by role successfully", async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, users: [mockUser] } });
 
    const result = await fetchUsersByRole("manager");
 
    expect(result).toEqual([mockUser]);
    expect(axios.get).toHaveBeenCalledWith("http://localhost:5005/api/users/role/manager", headers);
  });
 
  // Test fetchUsersByRole failure - No users found
  it("should return an empty array if no users found for the role", async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, users: [] } });
 
    const result = await fetchUsersByRole("unknownRole");
 
    expect(result).toEqual([]);
  });
 
  // Test toggleUserStatus success - Activate user
  it("should activate user successfully", async () => {
    axios.put.mockResolvedValueOnce({ data: { success: true, user: mockUser } });
 
    const result = await toggleUserStatus(1, true);
 
    expect(result).toEqual(mockUser);
    expect(axios.put).toHaveBeenCalledWith("http://localhost:5005/api/users/toggle/1", { isActive: true }, headers);
  });
 
  // Test toggleUserStatus success - Deactivate user
  it("should deactivate user successfully", async () => {
    axios.put.mockResolvedValueOnce({ data: { success: true, user: mockUser } });
 
    const result = await toggleUserStatus(1, false);
 
    expect(result).toEqual(mockUser);
    expect(axios.put).toHaveBeenCalledWith("http://localhost:5005/api/users/toggle/1", { isActive: false }, headers);
  });
 
  // Test fetchUserDetails failure - User not found
  it("should throw an error when fetchUserDetails fails due to user not found", async () => {
    axios.get.mockRejectedValueOnce({ response: { status: 404, data: { message: "User not found" } } });
 
    await expect(fetchUserDetails("invalidUser")).rejects.toThrow("Failed to fetch user details");
  });
 
  // Test updateUserProfile failure - Validation error
  it("should throw an error when updateUserProfile fails due to invalid data", async () => {
    axios.put.mockRejectedValueOnce({ response: { data: { message: "Invalid profile data" } } });
 
    await expect(updateUserProfile("testUser", {})).rejects.toThrow("Failed to update profile");
  });
 
  // Test fetchUsersByRole failure - API error
  it("should throw an error when fetchUsersByRole fails due to API issue", async () => {
    axios.get.mockRejectedValueOnce(new Error("Service unavailable"));
 
    await expect(fetchUsersByRole("manager")).rejects.toThrow("Service unavailable");
  });
 
  // Test toggleUserStatus failure - API error
  it("should throw an error if toggleUserStatus request fails due to API error", async () => {
    axios.put.mockRejectedValueOnce({ response: { data: { message: "Cannot toggle status" } } });
 
    await expect(toggleUserStatus(1, true)).rejects.toThrow("Error toggling user status");
  });
 
  // Test toggleUserStatus failure - Network issue
  it("should throw a generic error if toggleUserStatus fails due to network issue", async () => {
    axios.put.mockRejectedValueOnce(new Error("Network Error"));
 
    await expect(toggleUserStatus(1, true)).rejects.toThrow("Network Error");
  });
 
  // Test toggleUserStatus failure - Missing ID
  it("should throw an error if user ID is missing in toggleUserStatus", async () => {
    await expect(toggleUserStatus(null, true)).rejects.toThrow("Cannot read properties of undefined (reading 'data')");
  });
});