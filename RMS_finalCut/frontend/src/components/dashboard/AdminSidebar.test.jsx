import React from "react";

import { render, screen, fireEvent } from "@testing-library/react";

import { MemoryRouter } from "react-router-dom";

import "@testing-library/jest-dom";

import { expect, describe, it, beforeEach, vi } from "vitest";
 
import AdminSidebar from "./AdminSidebar"; // Adjust path accordingly
 
// Mock lucide-react icons based on what's actually used in AdminSidebar component

vi.mock("lucide-react", () => ({

  Home: () => <svg>Home Icon</svg>,

  UserPlus: () => <svg>UserPlus Icon</svg>,

  Users: () => <svg>Users Icon</svg>,

  DollarSign: () => <svg>DollarSign Icon</svg>, // Changed from CreditCard to DollarSign

  User: () => <svg>User Icon</svg>,

  // Add any other icons used in AdminSidebar.jsx

}));
 
describe("AdminSidebar Component", () => {

  let toggleSidebarMock;
 
  beforeEach(() => {

    toggleSidebarMock = vi.fn();

    vi.clearAllMocks();

  });
 
  it("renders sidebar with correct links", () => {

    render(
<MemoryRouter>
<AdminSidebar isOpen={true} toggleSidebar={toggleSidebarMock} />
</MemoryRouter>

    );
 
    // Check if all links are present

    expect(screen.getByText("Dashboard")).toBeInTheDocument();

    expect(screen.getByText("Create User Account")).toBeInTheDocument();

    expect(screen.getByText("Manage Users")).toBeInTheDocument();

    expect(screen.getByText("Payments")).toBeInTheDocument();

    expect(screen.getByText("View My Profile")).toBeInTheDocument();

  });
 
  it("calls toggleSidebar on mobile when a link is clicked", () => {

    global.innerWidth = 768; // Simulate mobile screen

    render(
<MemoryRouter>
<AdminSidebar isOpen={true} toggleSidebar={toggleSidebarMock} />
</MemoryRouter>

    );
 
    fireEvent.click(screen.getByText("Dashboard"));

    expect(toggleSidebarMock).toHaveBeenCalled();

  });
 
  it("does not call toggleSidebar on desktop when a link is clicked", () => {

    global.innerWidth = 1024; // Simulate desktop screen

    render(
<MemoryRouter>
<AdminSidebar isOpen={true} toggleSidebar={toggleSidebarMock} />
</MemoryRouter>

    );
 
    fireEvent.click(screen.getByText("Dashboard"));

    expect(toggleSidebarMock).not.toHaveBeenCalled();

  });
 
  it("clicking a link closes sidebar on mobile", () => {

    // Mock window.innerWidth < 1024 (simulate mobile)

    global.innerWidth = 768;

    window.dispatchEvent(new Event("resize"));
 
    render(
<MemoryRouter>
<AdminSidebar isOpen={true} toggleSidebar={toggleSidebarMock} />
</MemoryRouter>

    );
 
    // Click on a link

    fireEvent.click(screen.getByText("Dashboard"));
 
    // Ensure toggleSidebar is called on mobile

    expect(toggleSidebarMock).toHaveBeenCalled();

  });
 
  it("clicking a link does NOT close sidebar on desktop", () => {

    // Mock window.innerWidth >= 1024 (simulate desktop)

    global.innerWidth = 1280;

    window.dispatchEvent(new Event("resize"));
 
    render(
<MemoryRouter>
<AdminSidebar isOpen={true} toggleSidebar={toggleSidebarMock} />
</MemoryRouter>

    );
 
    // Click on a link

    fireEvent.click(screen.getByText("Dashboard"));
 
    // Ensure toggleSidebar is NOT called on desktop

    expect(toggleSidebarMock).not.toHaveBeenCalled();

  });
 
  it("sidebar has correct styling and structure", () => {

    render(
<MemoryRouter>
<AdminSidebar isOpen={true} toggleSidebar={() => {}} />
</MemoryRouter>

    );
 
    // Ensure sidebar header is present

    expect(screen.getByText("RMS")).toBeInTheDocument();
 
    // Ensure sidebar contains correct number of links

    expect(screen.getAllByRole("link").length).toBe(5);

  });
 
  it("displays icons correctly", () => {

    render(
<MemoryRouter>
<AdminSidebar isOpen={true} toggleSidebar={toggleSidebarMock} />
</MemoryRouter>

    );
 
    // Check if the icons are displayed correctly

    expect(screen.getByText("Home Icon")).toBeInTheDocument();

    expect(screen.getByText("UserPlus Icon")).toBeInTheDocument();

    expect(screen.getByText("Users Icon")).toBeInTheDocument();

    expect(screen.getByText("DollarSign Icon")).toBeInTheDocument(); // Updated to match the mock

    expect(screen.getByText("User Icon")).toBeInTheDocument();

  });
 
  it("sidebar visibility changes based on isOpen prop", () => {

    const { container, rerender } = render(
<MemoryRouter>
<AdminSidebar isOpen={false} toggleSidebar={() => {}} />
</MemoryRouter>

    );
 
    // Check if sidebar is hidden

    expect(container.firstChild).toHaveClass("-translate-x-full");
 
    // Re-render with isOpen = true

    rerender(
<MemoryRouter>
<AdminSidebar isOpen={true} toggleSidebar={() => {}} />
</MemoryRouter>

    );
 
    // Check if sidebar is visible

    expect(container.firstChild).toHaveClass("translate-x-0");

  });

});
 