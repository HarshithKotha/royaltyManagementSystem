import { render, screen, waitFor, fireEvent, cleanup, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, beforeEach, afterEach, beforeAll, it, expect, vi } from "vitest";
import ManagerSummary from "../../../components/dashboard/managerPages/ManagerSummary";
import { useAuth } from "../../../context/authContext";
import { fetchUserDetails } from "../../../services/userService";
import SongService from "../../../services/SongService";

vi.mock("../../../services/userService", () => ({
  fetchUserDetails: vi.fn(),
}));

vi.mock("../../../services/SongService", () => ({
  fetchSongsByArtist: vi.fn(),
}));

vi.mock("../../../context/authContext", () => ({
  useAuth: vi.fn(),
}));

beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

describe("ManagerSummary Component", () => {
  const mockUserData = { username: "manager123" };
  const mockArtists = [
    { _id: "1", fullName: "Artist One", fullRoyalty: 200 },
    { _id: "2", fullName: "Artist Two", fullRoyalty: 500 },
  ];
  const mockSongs = [
    { songName: "Song A", totalStreams: 1000, totalRoyalty: 50 },
    { songName: "Song B", totalStreams: 2000, totalRoyalty: 100 },
  ];

  beforeEach(() => {
    vi.clearAllMocks(); // Ensures no mock data leaks between tests
    useAuth.mockReturnValue({ userData: mockUserData });
    fetchUserDetails.mockResolvedValue({ managedArtists: mockArtists });
  });

  afterEach(() => {
    cleanup(); // Ensures fresh component rendering
  });

  it("renders summary information correctly", async () => {
    render(<ManagerSummary />);
    await waitFor(() => {
      expect(screen.getByText("Manager Dashboard")).toBeInTheDocument();
      expect(screen.getByText("Total Managed Artists")).toBeInTheDocument();
      expect(screen.getByText("Total Managed Royalty")).toBeInTheDocument();
      expect(screen.getByText("Top Artist (by Royalty)")).toBeInTheDocument();
    });
  });

  it("fetches and displays managed artists", async () => {
    render(<ManagerSummary />);
    await waitFor(() => {
      expect(screen.getAllByText("Artist Two").length).toBeGreaterThan(0);
    });
  });

//   it("updates song data when an artist is selected", async () => {
//     SongService.fetchSongsByArtist.mockResolvedValue(mockSongs);
//     render(<ManagerSummary />);

//     await waitFor(() => expect(screen.getByText("Artist One")).toBeInTheDocument());

//     const selectElement = screen.getByRole("combobox");

//     await act(async () => {
//       fireEvent.change(selectElement, { target: { value: "1" } });
//     });

//     await waitFor(() => {
//       expect(screen.getByText("Top Performing Songs by Streams")).toBeInTheDocument();
//     });

//     expect(screen.getByText("Song A")).toBeInTheDocument();
//     expect(screen.getByText("Song B")).toBeInTheDocument();
//   });

  it("handles API failure when fetching artists", async () => {
    fetchUserDetails.mockRejectedValue(new Error("Failed to fetch artists"));
    render(<ManagerSummary />);

    await waitFor(() => {
      expect(screen.getByText("Manager Dashboard")).toBeInTheDocument();
      expect(screen.queryByText("Artist One")).not.toBeInTheDocument();
    });

    expect(fetchUserDetails).toHaveBeenCalledTimes(1);
  });

  // it("handles API failure when fetching songs", async () => {
  //   SongService.fetchSongsByArtist.mockRejectedValue(new Error("Failed to fetch song data"));
  //   render(<ManagerSummary />);

  //   await waitFor(() => expect(screen.getByText("Artist One")).toBeInTheDocument());

  //   const selectElement = screen.getByRole("combobox");

  //   await act(async () => {
  //     fireEvent.change(selectElement, { target: { value: "1" } });
  //   });

  //   await waitFor(() => {
  //     expect(screen.getByText("No song data available for this artist.")).toBeInTheDocument();
  //   });

  //   expect(SongService.fetchSongsByArtist).toHaveBeenCalledWith("1");
  // });

  it("does not fetch artists if userData is missing", async () => {
    useAuth.mockReturnValue({ userData: null });
    render(<ManagerSummary />);

    await waitFor(() => {
      expect(fetchUserDetails).not.toHaveBeenCalled();
    });
  });
});
