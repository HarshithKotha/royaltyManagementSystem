import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import UpdateManagerProfileForm from "./UpdateManagerProfileForm";
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

describe("UpdateManagerProfileForm", () => {
  beforeEach(() => {
    useAuth.mockReturnValue({
      user: { username: "manageruser" },
      userData: { fullName: "Manager User", managedArtists: [{ artistId: "456" }] },
      loading: false,
    });
    useNotifications.mockReturnValue({ sendNotification: vi.fn() });
  });

  test("renders form with user data", async () => {
    fetchUserDetails.mockResolvedValue({
      fullName: "Manager User",
      mobileNo: "9876543210",
      commissionPercentage: "10",
      address: "Manager Street",
      description: "Managing artists efficiently",
    });

    render(<UpdateManagerProfileForm />);

    await waitFor(() => expect(fetchUserDetails).toHaveBeenCalledWith("manageruser"));
    await waitFor(() => expect(screen.queryByText("Loading...")).not.toBeInTheDocument());

    expect(await screen.findByLabelText(/Full Name/i)).toHaveValue("Manager User");
    expect(screen.getByLabelText(/Mobile Number/i)).toHaveValue("9876543210");
    expect(screen.getByLabelText(/Commission Percentage/i)).toHaveValue(10);
    expect(screen.getByLabelText(/Address/i)).toHaveValue("Manager Street");
    expect(screen.getByLabelText(/Description/i)).toHaveValue("Managing artists efficiently");
  });

  test("shows validation errors for invalid input", async () => {
    fetchUserDetails.mockResolvedValue({ fullName: "", mobileNo: "", commissionPercentage: "", address: "", description: "" });
    render(<UpdateManagerProfileForm />);

    await waitFor(() => screen.getByLabelText(/Full Name/i));

    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: "a" } });
    fireEvent.change(screen.getByLabelText(/Mobile Number/i), { target: { value: "123" } });
    fireEvent.change(screen.getByLabelText(/Commission Percentage/i), { target: { value: "200" } });
    fireEvent.change(screen.getByLabelText(/Address/i), { target: { value: "12" } });
    fireEvent.submit(screen.getByRole("button", { name: /Update Profile/i }));

    expect(await screen.findByText(/Full Name must be at least 3 characters/i)).toBeInTheDocument();
    expect(screen.getByText(/Enter a valid 10-digit mobile number/i)).toBeInTheDocument();
    expect(screen.getByText(/Commission must be between 1 and 100/i)).toBeInTheDocument();
    expect(screen.getByText(/Address must be at least 5 characters/i)).toBeInTheDocument();
  });

  test("submits valid form and updates profile", async () => {
    fetchUserDetails.mockResolvedValue({ fullName: "Manager User", mobileNo: "9876543210", commissionPercentage: "10", address: "Manager Street", description: "Managing artists efficiently" });
    updateUserProfile.mockResolvedValue({});

    render(<UpdateManagerProfileForm />);
    await waitFor(() => screen.getByLabelText(/Full Name/i));

    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: "Updated Manager" } });
    fireEvent.submit(screen.getByRole("button", { name: /Update Profile/i }));

    await waitFor(() => expect(updateUserProfile).toHaveBeenCalledWith("manageruser", expect.objectContaining({ fullName: "Updated Manager" })));
    expect(screen.getByText(/Profile updated successfully!/i)).toBeInTheDocument();
  });

  test("handles update profile failure", async () => {
    fetchUserDetails.mockResolvedValue({ fullName: "Manager User", mobileNo: "9876543210", commissionPercentage: "10", address: "Manager Street", description: "Managing artists efficiently" });
    updateUserProfile.mockRejectedValue(new Error("Update failed"));

    render(<UpdateManagerProfileForm />);
    await waitFor(() => screen.getByLabelText(/Full Name/i));

    fireEvent.submit(screen.getByRole("button", { name: /Update Profile/i }));
    await waitFor(() => expect(updateUserProfile).toHaveBeenCalled());
    expect(screen.getByText(/Failed to update profile/i)).toBeInTheDocument();
  });
});