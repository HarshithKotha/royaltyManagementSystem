import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ArtistsTable from "./ArtistTable";
import "@testing-library/jest-dom";

// Mock SearchBar component
vi.mock("../../commonComponents/SearchBar", () => ({
  default: ({ onSearch }) => (
    <input
      type="text"
      placeholder="Search here..."
      onChange={(e) => onSearch(e.target.value)}
      data-testid="search-input"
    />
  ),
}));

describe("ArtistsTable", () => {
  const mockArtists = [
    { fullName: "Artist One", totalStreams: 1000, fullRoyalty: 500 },
    { fullName: "Artist Two", totalStreams: 2000, fullRoyalty: 1000 },
    { fullName: "Artist Three", totalStreams: 500, fullRoyalty: 250 },
  ];

  it("renders table with artist data", () => {
    render(<ArtistsTable artists={mockArtists} />);

    expect(screen.getByText(/All Artists/i)).toBeInTheDocument();
    expect(screen.getByText("Artist One")).toBeInTheDocument();
    expect(screen.getByText("Artist Two")).toBeInTheDocument();
    expect(screen.getByText("Artist Three")).toBeInTheDocument();
    expect(screen.getByText("$500.00")).toBeInTheDocument();
    expect(screen.getByText("$1000.00")).toBeInTheDocument();
    expect(screen.getByText("$250.00")).toBeInTheDocument();
  });

  it("filters artists based on search input", () => {
    render(<ArtistsTable artists={mockArtists} />);

    const searchInput = screen.getByTestId("search-input");
    fireEvent.change(searchInput, { target: { value: "Artist One" } });

    expect(screen.getByText("Artist One")).toBeInTheDocument();
    expect(screen.queryByText("Artist Two")).not.toBeInTheDocument();
    expect(screen.queryByText("Artist Three")).not.toBeInTheDocument();
  });

  it("displays 'No artists found' when no match is found", () => {
    render(<ArtistsTable artists={mockArtists} />);

    const searchInput = screen.getByTestId("search-input");
    fireEvent.change(searchInput, { target: { value: "Unknown" } });

    expect(screen.getByText("No artists found")).toBeInTheDocument();
    expect(screen.queryByText("Artist One")).not.toBeInTheDocument();
    expect(screen.queryByText("Artist Two")).not.toBeInTheDocument();
    expect(screen.queryByText("Artist Three")).not.toBeInTheDocument();
  });

  it("renders correctly when artist list is empty", () => {
    render(<ArtistsTable artists={[]} />);

    expect(screen.getByText(/All Artists/i)).toBeInTheDocument();
    expect(screen.getByText("No artists found")).toBeInTheDocument();
  });
});