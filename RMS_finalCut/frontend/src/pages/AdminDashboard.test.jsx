import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import AdminDashboard from "./AdminDashboard";
import { useAuth } from "../context/authContext";
import { BrowserRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import { vi } from "vitest";
 
//  Mock dependencies
vi.mock("../context/authContext", () => ({
  useAuth: vi.fn(),
}));
 
vi.mock("../components/commonComponents/Navbar", () => ({
  __esModule: true,
  default: ({ toggleSidebar }) => (
<div data-testid="navbar">
<button onClick={toggleSidebar}>Toggle Sidebar</button>
</div>
  ),
}));
 
vi.mock("../components/dashboard/AdminSidebar", () => ({
  __esModule: true,
  default: ({ isOpen }) => (
<div data-testid="admin-sidebar">{isOpen ? "Sidebar Open" : "Sidebar Closed"}</div>
  ),
}));
 
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    Outlet: () => <div data-testid="outlet">Outlet Content</div>,
  };
});
 
describe("AdminDashboard Component", () => {
  beforeEach(() => {
    useAuth.mockReturnValue({ user: { role: "admin" } });
  });
 
  afterEach(() => {
    vi.clearAllMocks();
  });
 
  // Test: Renders without crashing
  test("renders AdminDashboard correctly", () => {
    render(
<BrowserRouter>
<AdminDashboard />
</BrowserRouter>
    );
 
    expect(screen.getByTestId("navbar")).toBeInTheDocument();
    expect(screen.getByTestId("admin-sidebar")).toBeInTheDocument();
    expect(screen.getByTestId("outlet")).toBeInTheDocument();
  });
 
  //  Test: Sidebar toggles when button is clicked
  test("toggles sidebar when button is clicked", () => {
    render(
<BrowserRouter>
<AdminDashboard />
</BrowserRouter>
    );
 
    const toggleButton = screen.getByText("Toggle Sidebar");
 
    // Sidebar should initially be closed
    expect(screen.getByText("Sidebar Closed")).toBeInTheDocument();
 
    // Click to open sidebar
    fireEvent.click(toggleButton);
    expect(screen.getByText("Sidebar Open")).toBeInTheDocument();
 
    // Click to close sidebar
    fireEvent.click(toggleButton);
    expect(screen.getByText("Sidebar Closed")).toBeInTheDocument();
  });
 
  // Test: Works without user context
  test("renders without user context", () => {
    useAuth.mockReturnValue({ user: null });
 
    render(
<BrowserRouter>
<AdminDashboard />
</BrowserRouter>
    );
 
    expect(screen.getByTestId("navbar")).toBeInTheDocument();
    expect(screen.getByTestId("admin-sidebar")).toBeInTheDocument();
  });
});