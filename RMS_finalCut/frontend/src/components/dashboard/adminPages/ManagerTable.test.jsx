import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ManagerTable from "./ManagerTable";
import "@testing-library/jest-dom";

// Mock SearchBar component
vi.mock("../../commonComponents/SearchBar", () => ({
  default: ({ onSearch }) => (
    <input
      type="text"
      placeholder="Search..."
      onChange={(e) => onSearch(e.target.value)}
      data-testid="search-input"
    />
  ),
}));

describe("ManagerTable", () => {
  const mockManagers = [
    { name: "John Doe", totalStreams: 5000, totalRoyalty: 200.5 },
    { name: "Jane Smith", totalStreams: 3000, totalRoyalty: 150.75 },
    { name: "Mike Johnson", totalStreams: 1000, totalRoyalty: 50.25 },
  ];

  it("renders table with manager data", () => {
    render(<ManagerTable managers={mockManagers} />);

    expect(screen.getByText(/All Managers/i)).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByText("Mike Johnson")).toBeInTheDocument();
    expect(screen.getByText("$ 200.50")).toBeInTheDocument();
    expect(screen.getByText("$ 150.75")).toBeInTheDocument();
    expect(screen.getByText("$ 50.25")).toBeInTheDocument();
  });

  it("filters managers based on search input", () => {
    render(<ManagerTable managers={mockManagers} />);

    const searchInput = screen.getByTestId("search-input");
    fireEvent.change(searchInput, { target: { value: "Jane" } });

    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
    expect(screen.queryByText("Mike Johnson")).not.toBeInTheDocument();
  });

  it("displays no managers if no match found", () => {
    render(<ManagerTable managers={mockManagers} />);

    const searchInput = screen.getByTestId("search-input");
    fireEvent.change(searchInput, { target: { value: "Unknown" } });

    expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
    expect(screen.queryByText("Jane Smith")).not.toBeInTheDocument();
    expect(screen.queryByText("Mike Johnson")).not.toBeInTheDocument();
  });

  it("renders correctly when manager list is empty", () => {
    render(<ManagerTable managers={[]} />);

    expect(screen.getByText(/All Managers/i)).toBeInTheDocument();
    expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
  });
});
