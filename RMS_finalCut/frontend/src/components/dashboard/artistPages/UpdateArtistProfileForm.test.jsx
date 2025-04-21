import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import UpdateArtistProfileForm from "./updateArtistProfileForm";
import { useAuth } from "../../../context/authContext";
import { useNotifications } from "../../../context/NotificationContext";
import { fetchUserDetails, updateUserProfile } from "../../../services/userService";
import "@testing-library/jest-dom";


vi.mock("../../../context/authContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../../../context/NotificationContext", () => ({
  useNotifications: vi.fn(),
}));

vi.mock("../../../services/userService", () => ({
  fetchUserDetails: vi.fn(),
  updateUserProfile: vi.fn(),
}));

describe("UpdateArtistProfileForm", () => {
  beforeEach(() => {
    useAuth.mockReturnValue({
      user: { username: "testuser" },
      userData: { fullName: "Test User", manager: { managerId: "123" } },
      loading: false,
    });
    useNotifications.mockReturnValue({ sendNotification: vi.fn() });
  });

  test("renders form with user data", async () => {
    fetchUserDetails.mockResolvedValue({
      fullName: "Test User",
      mobileNo: "9876543210",
      address: "123 Street",
      description: "Test Description",
    });
  
    render(<UpdateArtistProfileForm />);
  
    // Ensure the API call is made
    await waitFor(() => expect(fetchUserDetails).toHaveBeenCalledWith("testuser"));
  
    // Wait until the form is rendered and "Loading..." disappears
    await waitFor(() => expect(screen.queryByText("Loading...")).not.toBeInTheDocument());
  
    // Now check the form fields
    expect(await screen.findByLabelText(/Full Name/i)).toHaveValue("Test User");
    expect(screen.getByLabelText(/Mobile Number/i)).toHaveValue("9876543210");
    expect(screen.getByLabelText(/Address/i)).toHaveValue("123 Street");
    expect(screen.getByLabelText(/Description/i)).toHaveValue("Test Description");
  });
  

  test("shows validation errors for invalid input", async () => {
    fetchUserDetails.mockResolvedValue({ fullName: "", mobileNo: "", address: "", description: "" });
    render(<UpdateArtistProfileForm />);

    await waitFor(() => screen.getByLabelText(/Full Name/i));

    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: "a" } });
    fireEvent.change(screen.getByLabelText(/Mobile Number/i), { target: { value: "123" } });
    fireEvent.change(screen.getByLabelText(/Address/i), { target: { value: "12" } });
    fireEvent.submit(screen.getByRole("button", { name: /Update Profile/i }));

    expect(await screen.findByText(/Full Name must be at least 3 characters/i)).toBeInTheDocument();
    expect(screen.getByText(/Enter a valid 10-digit mobile number/i)).toBeInTheDocument();
    expect(screen.getByText(/Address must be at least 5 characters/i)).toBeInTheDocument();
  });

  test("submits valid form and updates profile", async () => {
    fetchUserDetails.mockResolvedValue({ fullName: "Test User", mobileNo: "9876543210", address: "123 Street", description: "Test Description" });
    updateUserProfile.mockResolvedValue({});

    render(<UpdateArtistProfileForm />);
    await waitFor(() => screen.getByLabelText(/Full Name/i));

    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: "Updated User" } });
    fireEvent.submit(screen.getByRole("button", { name: /Update Profile/i }));

    await waitFor(() => expect(updateUserProfile).toHaveBeenCalledWith("testuser", expect.objectContaining({ fullName: "Updated User" })));
    expect(screen.getByText(/Profile updated successfully!/i)).toBeInTheDocument();
  });

  test("handles update profile failure", async () => {
    fetchUserDetails.mockResolvedValue({ fullName: "Test User", mobileNo: "9876543210", address: "123 Street", description: "Test Description" });
    updateUserProfile.mockRejectedValue(new Error("Update failed"));

    render(<UpdateArtistProfileForm />);
    await waitFor(() => screen.getByLabelText(/Full Name/i));

    fireEvent.submit(screen.getByRole("button", { name: /Update Profile/i }));
    await waitFor(() => expect(updateUserProfile).toHaveBeenCalled());
    expect(screen.getByText(/Failed to update profile/i)).toBeInTheDocument();
  });
});