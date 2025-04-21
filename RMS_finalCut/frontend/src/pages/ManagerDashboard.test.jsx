import { render, screen, fireEvent } from "@testing-library/react";
import ManagerDashboard from "./ManagerDashboard";
import { useAuth } from "../context/authContext";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock useAuth to control user authentication state
vi.mock("../context/authContext", () => ({
  useAuth: vi.fn(),
}));

// Mock ManagerSidebar and Navbar components
vi.mock("../components/dashboard/ManagerSidebar", () => ({
  __esModule: true,
  default: ({ isOpen, toggleSidebar }) => (
    <div data-testid="sidebar" className={isOpen ? "open" : "closed"}>
      <button onClick={toggleSidebar} data-testid="sidebar-toggle">Toggle Sidebar</button>
    </div>
  ),
}));

vi.mock("../components/commonComponents/Navbar", () => ({
  __esModule: true,
  default: ({ toggleSidebar, isSidebarOpen }) => (
    <nav data-testid="navbar" className={isSidebarOpen ? "sidebar-open" : "sidebar-closed"}>
      <button onClick={toggleSidebar} data-testid="navbar-toggle">Open Sidebar</button>
    </nav>
  ),
}));

// Mock Outlet for nested routes
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    Outlet: () => <div data-testid="outlet">Nested Route Content</div>,
  };
});

const renderWithProviders = () => {
  return render(
    <MemoryRouter>
      <ManagerDashboard />
    </MemoryRouter>
  );
};

describe("ManagerDashboard Component", () => {
  beforeEach(() => {
    useAuth.mockReturnValue({ user: { role: "manager" } });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders ManagerDashboard correctly", () => {
    renderWithProviders();

    expect(screen.getByTestId("sidebar")).toBeInTheDocument();
    expect(screen.getByTestId("navbar")).toBeInTheDocument();
    expect(screen.getByTestId("outlet")).toBeInTheDocument();
  });

  it("toggles sidebar when sidebar toggle button is clicked", () => {
    renderWithProviders();

    const sidebar = screen.getByTestId("sidebar");
    const sidebarToggleButton = screen.getByTestId("sidebar-toggle");

    expect(sidebar).toHaveClass("closed");

    fireEvent.click(sidebarToggleButton);
    expect(sidebar).toHaveClass("open");

    fireEvent.click(sidebarToggleButton);
    expect(sidebar).toHaveClass("closed");
  });

  it("toggles sidebar when navbar toggle button is clicked", () => {
    renderWithProviders();

    const sidebar = screen.getByTestId("sidebar");
    const navbarToggleButton = screen.getByTestId("navbar-toggle");

    expect(sidebar).toHaveClass("closed");

    fireEvent.click(navbarToggleButton);
    expect(sidebar).toHaveClass("open");

    fireEvent.click(navbarToggleButton);
    expect(sidebar).toHaveClass("closed");
  });

  it("keeps sidebar open when toggled multiple times", () => {
    renderWithProviders();

    const sidebar = screen.getByTestId("sidebar");
    const sidebarToggleButton = screen.getByTestId("sidebar-toggle");

    expect(sidebar).toHaveClass("closed");

    fireEvent.click(sidebarToggleButton);
    fireEvent.click(sidebarToggleButton);
    fireEvent.click(sidebarToggleButton);

    expect(sidebar).toHaveClass("open");
  });

  it("applies correct class when sidebar is open", () => {
    renderWithProviders();

    const sidebarToggleButton = screen.getByTestId("sidebar-toggle");
    const navbar = screen.getByTestId("navbar");

    expect(navbar).toHaveClass("sidebar-closed");

    fireEvent.click(sidebarToggleButton);
    expect(navbar).toHaveClass("sidebar-open");

    fireEvent.click(sidebarToggleButton);
    expect(navbar).toHaveClass("sidebar-closed");
  });

  it("renders correctly even if user is null", () => {
    useAuth.mockReturnValue({ user: null });

    renderWithProviders();

    expect(screen.getByTestId("sidebar")).toBeInTheDocument();
    expect(screen.getByTestId("navbar")).toBeInTheDocument();
    expect(screen.getByTestId("outlet")).toBeInTheDocument();
  });

  it("handles missing user property gracefully", () => {
    useAuth.mockReturnValue({});

    renderWithProviders();

    expect(screen.getByTestId("sidebar")).toBeInTheDocument();
    expect(screen.getByTestId("navbar")).toBeInTheDocument();
    expect(screen.getByTestId("outlet")).toBeInTheDocument();
  });
});
