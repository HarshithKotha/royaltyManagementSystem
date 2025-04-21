import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import AdminSummary from "./AdminSummary";
import { useArtistsManagers } from "../../../context/ArtistsManagersContext";
import "@testing-library/jest-dom";

// Mock Context
vi.mock("../../../context/ArtistsManagersContext", () => ({
  useArtistsManagers: vi.fn(),
}));

// Mock Components
vi.mock("./TopArtistChart", () => ({
  default: ({ data }) => (data.length > 0 ? <div data-testid="top-artists-chart" /> : null),
}));

vi.mock("./TopManagerCharts", () => ({
  default: ({ data }) => (data.length > 0 ? <div data-testid="top-managers-chart" /> : null),
}));

vi.mock("./ArtistTable", () => ({
  default: () => <div data-testid="artists-table" />,
}));

vi.mock("./ManagerTable", () => ({
  default: () => <div data-testid="managers-table" />,
}));

vi.mock("../../commonComponents/SummaryCard", () => ({
  default: ({ title, value }) => (
    <div data-testid={`summary-card-${title.toLowerCase().replace(" ", "-")}`}>
      {title}: {value}
    </div>
  ),
}));

describe("AdminSummary Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the admin dashboard title", () => {
    useArtistsManagers.mockReturnValue({ artists: [], managers: [], managerStats: [] });
    render(<AdminSummary />);
    expect(screen.getByText("Admin Dashboard")).toBeInTheDocument();
  });

  it("renders summary cards with correct values", async () => {
    useArtistsManagers.mockReturnValue({
      artists: [{ _id: "1" }, { _id: "2" }],
      managers: [{ _id: "m1" }, { _id: "m2" }, { _id: "m3" }],
      managerStats: [],
    });

    render(<AdminSummary />);

    expect(screen.getByTestId("summary-card-total-artists")).toHaveTextContent("Total Artists: 2");
    expect(screen.getByTestId("summary-card-total-managers")).toHaveTextContent("Total Managers: 3");
  });

  it("renders top artists chart when there are artists", async () => {
    useArtistsManagers.mockReturnValue({
      artists: [{ _id: "1", fullName: "Artist One" }],
      managers: [],
      managerStats: [],
    });
    render(<AdminSummary />);
    await waitFor(() => {
      expect(screen.getByTestId("top-artists-chart")).toBeInTheDocument();
    });
  });

  it("does not render top artists chart when no artists exist", async () => {
    useArtistsManagers.mockReturnValue({ artists: [], managers: [], managerStats: [] });
    render(<AdminSummary />);
    await waitFor(() => {
      expect(screen.queryByTestId("top-artists-chart")).not.toBeInTheDocument();
    });
  });

  it("renders top managers chart when there are manager stats", async () => {
    useArtistsManagers.mockReturnValue({
      artists: [],
      managers: [],
      managerStats: [{ _id: "m1", name: "Manager One" }],
    });
    render(<AdminSummary />);
    await waitFor(() => {
      expect(screen.getByTestId("top-managers-chart")).toBeInTheDocument();
    });
  });

  it("does not render top managers chart when managerStats is empty", async () => {
    useArtistsManagers.mockReturnValue({ artists: [], managers: [], managerStats: [] });
    render(<AdminSummary />);
    await waitFor(() => {
      expect(screen.queryByTestId("top-managers-chart")).not.toBeInTheDocument();
    });
  });

  it("renders artist and manager tables", async () => {
    useArtistsManagers.mockReturnValue({
      artists: [{ _id: "1", fullName: "Artist One" }],
      managers: [{ _id: "m1", name: "Manager One" }],
      managerStats: [],
    });

    render(<AdminSummary />);

    await waitFor(() => {
      expect(screen.getByTestId("artists-table")).toBeInTheDocument();
      expect(screen.getByTestId("managers-table")).toBeInTheDocument();
    });
  });

  it("handles empty state gracefully", async () => {
    useArtistsManagers.mockReturnValue({ artists: [], managers: [], managerStats: [] });
    render(<AdminSummary />);
    await waitFor(() => {
      expect(screen.getByTestId("summary-card-total-artists")).toHaveTextContent("Total Artists: 0");
      expect(screen.getByTestId("summary-card-total-managers")).toHaveTextContent("Total Managers: 0");
    });
  });

  it("handles missing artists or managers gracefully", async () => {
    useArtistsManagers.mockReturnValue({}); // Empty object instead of undefined
    render(<AdminSummary />);
    
    await waitFor(() => {
      expect(screen.getByTestId("summary-card-total-artists")).toHaveTextContent("Total Artists: 0");
      expect(screen.getByTestId("summary-card-total-managers")).toHaveTextContent("Total Managers: 0");
    });
  });
});
