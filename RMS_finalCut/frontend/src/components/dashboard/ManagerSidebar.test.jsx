import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import { expect, describe, it, beforeEach, vi } from "vitest";
import ManagerSidebar from "./ManagerSidebar";
 
// Mock lucide-react icons to prevent module import errors

vi.mock("lucide-react", () => ({
  Home: () => <svg data-testid="home-icon">Home Icon</svg>,
  Users: () => <svg data-testid="users-icon">Users Icon</svg>,
  UserCheck: () => <svg data-testid="usercheck-icon">UserCheck Icon</svg>,
  XCircle: () => <svg data-testid="xcircle-icon">XCircle Icon</svg>,
  DollarSign: () => <svg data-testid="dollarsign-icon">DollarSign Icon</svg>,
  UserCog: () => <svg data-testid="usercog-icon">UserCog Icon</svg>,
}));
 
describe("ManagerSidebar Component", () => {
  let toggleSidebarMock;

  beforeEach(() => {
    toggleSidebarMock = vi.fn();
    vi.clearAllMocks();
  });

  it("renders all sidebar links correctly", () => {
    render(
    <MemoryRouter>
    <ManagerSidebar isOpen={true} toggleSidebar={toggleSidebarMock} />
    </MemoryRouter>
    );
    
    const links = [
      "Dashboard",
      "My Artists",
      "Collaboration Requests",
      "Collaboration Cancellation Requests",
      "Royalty Transactions",
      "Update Profile",
    ];
    links.forEach((text) => {
      expect(screen.getByText(text)).toBeInTheDocument();
    });
  });
  it("sidebar is open when isOpen is true", () => {
    const { container } = render(
      <MemoryRouter>
      <ManagerSidebar isOpen={true} toggleSidebar={toggleSidebarMock} />
      </MemoryRouter>
    );
    expect(container.firstChild).toHaveClass("translate-x-0");
  });
 
  it("sidebar is closed when isOpen is false", () => {
    const { container } = render(
      <MemoryRouter>
      <ManagerSidebar isOpen={false} toggleSidebar={toggleSidebarMock} />
      </MemoryRouter> 
    );
    expect(container.firstChild).toHaveClass("-translate-x-full");
  });
 
  it("calls toggleSidebar on link click when screen width is < 1024px", () => {
    global.innerWidth = 800; // Simulate mobile screen
    render(
      <MemoryRouter>
      <ManagerSidebar isOpen={true} toggleSidebar={toggleSidebarMock} />
      </MemoryRouter>
    );
    const dashboardLink = screen.getByText("Dashboard");
    fireEvent.click(dashboardLink); // Simulate click
    expect(toggleSidebarMock).toHaveBeenCalled(); // Sidebar toggles
  });
 
  it("does NOT call toggleSidebar on link click when screen width is >= 1024px", () => {
    global.innerWidth = 1200; // Simulate desktop screen
    render(
      <MemoryRouter>
      <ManagerSidebar isOpen={true} toggleSidebar={toggleSidebarMock} />
      </MemoryRouter>
    );
 
    const dashboardLink = screen.getByText("Dashboard");
    fireEvent.click(dashboardLink); // Simulate click
    expect(toggleSidebarMock).not.toHaveBeenCalled(); // Sidebar remains open
  });
 
  it("ensures all links are interactive", () => {
    render(
      <MemoryRouter>
      <ManagerSidebar isOpen={true} toggleSidebar={toggleSidebarMock} />
      </MemoryRouter>
    );
    const links = [
      "Dashboard",
      "My Artists",
      "Collaboration Requests",
      "Collaboration Cancellation Requests",
      "Royalty Transactions",
      "Update Profile",
    ];
 
    links.forEach((text) => {
      const link = screen.getByText(text);
      fireEvent.click(link);
      expect(link).toBeInTheDocument(); // Ensures link exists
    });
  });
 
  it("handles click events for all links", () => {
    global.innerWidth = 800; // Simulate mobile screen
    render(
      <MemoryRouter>
      <ManagerSidebar isOpen={true} toggleSidebar={toggleSidebarMock} />
      </MemoryRouter>
    );
 
    const links = [
      screen.getByText("Dashboard"),
      screen.getByText("My Artists"),
      screen.getByText("Collaboration Requests"),
      screen.getByText("Collaboration Cancellation Requests"),
      screen.getByText("Royalty Transactions"),
      screen.getByText("Update Profile"),
    ];
 
    links.forEach((link) => {
      fireEvent.click(link);
      expect(toggleSidebarMock).toHaveBeenCalled();
    });
    expect(toggleSidebarMock).toHaveBeenCalledTimes(links.length);
  });
 
  it("displays icons correctly", () => {
    render(
      <MemoryRouter>
      <ManagerSidebar isOpen={true} toggleSidebar={toggleSidebarMock} />
      </MemoryRouter>
    );
 
    // Check if the icons are displayed correctly

    expect(screen.getByText("Home Icon")).toBeInTheDocument();

    expect(screen.getByText("Users Icon")).toBeInTheDocument();

    expect(screen.getByText("UserCheck Icon")).toBeInTheDocument();

    expect(screen.getByText("XCircle Icon")).toBeInTheDocument();

    expect(screen.getByText("DollarSign Icon")).toBeInTheDocument();

    expect(screen.getByText("UserCog Icon")).toBeInTheDocument();

  });

});
 