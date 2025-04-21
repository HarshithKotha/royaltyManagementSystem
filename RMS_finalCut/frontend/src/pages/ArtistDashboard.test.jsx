import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { act } from "react";
import ArtistDashboard from "./ArtistDashboard";
import { useAuth } from "../context/authContext";
import "@testing-library/jest-dom";
import { describe, it, vi, beforeEach, expect } from "vitest";

// Mock useAuth hook
vi.mock("../context/authContext", () => ({
  useAuth: vi.fn(),
}));

// Mock child components
vi.mock("../components/commonComponents/Navbar", () => ({
  default: ({ toggleSidebar }) => (
    <button onClick={toggleSidebar}>Toggle Sidebar</button>
  ),
}));

vi.mock("../components/dashboard/ArtistSidebar", () => ({
  default: ({ isOpen }) => <div>{isOpen ? "Sidebar Open" : "Sidebar Closed"}</div>,
}));

describe("ArtistDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks(); // Ensure no test contamination
    useAuth.mockReturnValue({ user: { name: "Artist" } });
  });

  it("renders the ArtistDashboard with Navbar and Sidebar", async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <ArtistDashboard />
        </MemoryRouter>
      );
    });

    expect(screen.getByText("Sidebar Closed")).toBeInTheDocument();
    expect(screen.getByText("Toggle Sidebar")).toBeInTheDocument();
  });

  it("toggles the sidebar when button is clicked", async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <ArtistDashboard />
        </MemoryRouter>
      );
    });

    const toggleButton = screen.getByText("Toggle Sidebar");
    expect(screen.getByText("Sidebar Closed")).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(toggleButton);
    });

    expect(screen.getByText("Sidebar Open")).toBeInTheDocument();
  });
});
