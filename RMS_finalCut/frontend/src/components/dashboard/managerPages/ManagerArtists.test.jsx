import { render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import "@testing-library/jest-dom/vitest"; // Needed for matchers in Vitest
import ManagerArtists from "../../../components/dashboard/managerPages/ManagerArtists";
import { useAuth } from "../../../context/authContext";
import { fetchUserDetails } from "../../../services/userService";
import userEvent from "@testing-library/user-event";

vi.mock("../../../services/userService", () => ({
  fetchUserDetails: vi.fn(),
}));

vi.mock("../../../context/authContext", () => ({
  useAuth: vi.fn(),
}));

describe("ManagerArtists Component", () => {
  const mockUserData = { username: "manager123" };

  beforeEach(() => {
    vi.clearAllMocks(); // Clears all mocks before each test
    useAuth.mockReturnValue({ userData: mockUserData });
  });

  test("renders managed artists correctly", async () => {
    fetchUserDetails.mockResolvedValue({
      managedArtists: [
        {
          _id: "1",
          fullName: "Artist One",
          email: "artist1@example.com",
          mobileNo: "1234567890",
          address: "123 Street, City",
          totalStreams: 5000,
          fullRoyalty: 200.5,
        },
      ],
    });

    render(<ManagerArtists />);

    await waitFor(() => {
      expect(screen.getByText("Managed Artists")).toBeInTheDocument();
      expect(screen.getByText("Artist One")).toBeInTheDocument();
      expect(screen.getByText("123 Street, City")).toBeInTheDocument();
    });
  });

  test("handles API failure", async () => {
    fetchUserDetails.mockRejectedValue(new Error("Failed to fetch artists"));

    render(<ManagerArtists />);

    await waitFor(() => {
      expect(screen.getByText("Managed Artists")).toBeInTheDocument();
      expect(screen.getByText("No artists found.")).toBeInTheDocument();
    });
  });

  test("filters artists based on search input", async () => {
    fetchUserDetails.mockResolvedValue({
      managedArtists: [
        {
          _id: "1",
          fullName: "Artist One",
          email: "artist1@example.com",
          mobileNo: "1234567890",
          address: "123 Street, City",
          totalStreams: 5000,
          fullRoyalty: 200.5,
        },
        {
          _id: "2",
          fullName: "Artist Two",
          email: "artist2@example.com",
          mobileNo: "0987654321",
          address: "456 Avenue, City",
          totalStreams: 7000,
          fullRoyalty: 350.75,
        },
      ],
    });

    render(<ManagerArtists />);
    const searchInput = screen.getByPlaceholderText("Search here...");

    await waitFor(() => {
      expect(screen.getByText("Artist One")).toBeInTheDocument();
      expect(screen.getByText("Artist Two")).toBeInTheDocument();
    });

    await userEvent.type(searchInput, "Artist One");

    await waitFor(() => {
      expect(screen.getByText("Artist One")).toBeInTheDocument();
      expect(screen.queryByText("Artist Two")).not.toBeInTheDocument();
    });
  });

  test("does not fetch artists if userData is missing", async () => {
    useAuth.mockReturnValue({ userData: null });

    render(<ManagerArtists />);

    await waitFor(() => {
      expect(fetchUserDetails).not.toHaveBeenCalled();
    });
  });
});
