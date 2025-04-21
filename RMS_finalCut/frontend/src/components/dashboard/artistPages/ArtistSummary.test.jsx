import { render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { useAuth } from "../../../context/authContext";
import * as SongService from "../../../services/SongService";
import ArtistSummary from "../artistPages/ArtistSummary";
import "@testing-library/jest-dom";

// Mocking necessary modules
vi.mock("../../../context/authContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../../../services/SongService", () => ({
  fetchSongsByArtist: vi.fn(),
}));

// Mock recharts components to prevent ResizeObserver errors
vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
  BarChart: () => <div data-testid="mock-bar-chart">Mocked BarChart</div>,
  PieChart: () => <div data-testid="mock-pie-chart">Mocked PieChart</div>,
  Bar: () => <div>Mocked Bar</div>,
  Pie: () => <div>Mocked Pie</div>,
  Tooltip: () => <div>Mocked Tooltip</div>,
  Legend: () => <div>Mocked Legend</div>,
  XAxis: () => <div>Mocked XAxis</div>,
  YAxis: () => <div>Mocked YAxis</div>,
  Cell: () => <div>Mocked Cell</div>,
}));

describe("ArtistSummary Component", () => {
  beforeEach(() => {
    useAuth.mockReturnValue({
      userData: { _id: "123", name: "Test Artist" }, // Ensure the correct user ID is returned
    });

    SongService.fetchSongsByArtist.mockResolvedValue([
      { songName: "Song A", totalRoyalty: 100, totalStreams: 500 },
      { songName: "Song B", totalRoyalty: 150, totalStreams: 700 },
    ]);
  });

  // Test Case 1: Verifying Data Fetching and State Update
  // it("fetches and updates song data correctly", async () => {
  //   render(<ArtistSummary />);

  //   // Wait for the API call to be triggered with the correct arguments
  //   await waitFor(() => {
  //     expect(SongService.fetchSongsByArtist).toHaveBeenCalledWith("123"); // Ensure the correct user ID is passed
  //   });

  //   // Ensure that songs are rendered after fetching
  //   await waitFor(() => {
  //     expect(screen.getByText("Song A")).toBeInTheDocument();
  //     expect(screen.getByText("Song B")).toBeInTheDocument();
  //   });
  // });

  // Test Case 2: Rendering the Artist Dashboard
  it("renders the artist dashboard with summary cards", async () => {
    render(<ArtistSummary />);

    await waitFor(() => {
      expect(screen.getByText("Artist Dashboard")).toBeInTheDocument();
      expect(screen.getByText("Total Songs")).toBeInTheDocument();
      expect(screen.getByText("Top Song")).toBeInTheDocument();
      expect(screen.getByText("Total Royalty")).toBeInTheDocument();
      expect(screen.getByText("Total Streams")).toBeInTheDocument();
    });
  });

  // Test Case 3: Verifying the Summary Card Values
  // it("displays correct summary data", async () => {
  //   render(<ArtistSummary />);

  //   await waitFor(() => {
  //     expect(SongService.fetchSongsByArtist).toHaveBeenCalled();
  //     expect(screen.getByText("Total Songs: 2")).toBeInTheDocument(); // Ensures "Total Songs: 2" is shown
  //     expect(screen.getByText("Top Song")).toBeInTheDocument();
  //     expect(screen.getByText("Total Royalty")).toBeInTheDocument();
  //     expect(screen.getByText("Total Streams")).toBeInTheDocument();
  //   });

  //   // Check the song data is displayed
  //   await waitFor(() => {
  //     expect(screen.getByText("Song A")).toBeInTheDocument();
  //     expect(screen.getByText("Song B")).toBeInTheDocument();
  //   });
  // });

  // Test Case 4: Verifying Charts Rendering
  it("renders bar and pie charts correctly", async () => {
    render(<ArtistSummary />);

    // Wait for the charts to render
    await waitFor(() => {
      // Use `screen.getAllByTestId` to find all instances of the BarChart
      const barCharts = screen.getAllByTestId("mock-bar-chart");
      expect(barCharts).toHaveLength(2); // There should be two BarCharts (one for streams, one for royalties)
      
      const pieChart = screen.getByTestId("mock-pie-chart");
      expect(pieChart).toBeInTheDocument(); // Verify the PieChart is rendered
    });
  });

  // Test Case 5: Handling Empty Song Data
  it("handles empty song data correctly", async () => {
    SongService.fetchSongsByArtist.mockResolvedValue([]); // Mock empty data

    render(<ArtistSummary />);

    await waitFor(() => {
      // Verifying Total Songs is 0
      expect(screen.getByText("Total Songs").nextSibling).toHaveTextContent("0");

      // Verifying Top Song is N/A
      expect(screen.getByText("Top Song").nextSibling).toHaveTextContent("N/A");

      // Verifying Total Royalty is $0.00
      expect(screen.getByText("Total Royalty").nextSibling).toHaveTextContent("$0.00");

      // Verifying Total Streams is 0
      expect(screen.getByText("Total Streams").nextSibling).toHaveTextContent("0");
    });
  });

  // Test Case 6: Handling API Failure
  it("handles API failure correctly", async () => {
    SongService.fetchSongsByArtist.mockRejectedValue(new Error("Failed to fetch song data"));

    render(<ArtistSummary />);

    await waitFor(() => {
      expect(screen.getByText("Total Songs").nextSibling).toHaveTextContent("0");
      expect(screen.getByText("Top Song").nextSibling).toHaveTextContent("N/A");
      expect(screen.getByText("Total Royalty").nextSibling).toHaveTextContent("$0.00");
      expect(screen.getByText("Total Streams").nextSibling).toHaveTextContent("0");
    });
  });
});
