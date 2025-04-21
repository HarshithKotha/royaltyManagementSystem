import React from "react";

import { render, screen, fireEvent } from "@testing-library/react";

import { MemoryRouter } from "react-router-dom";

import "@testing-library/jest-dom";

import { expect, describe, it, beforeEach, vi } from "vitest";
 
import ArtistSidebar from "./ArtistSidebar";
 
// Mock the icons from lucide-react

vi.mock("lucide-react", () => ({

  Home: () => <svg>Home Icon</svg>,

  Music: () => <svg>Music Icon</svg>,

  PlusCircle: () => <svg>Plus Circle Icon</svg>,

  Trash2: () => <svg>Trash Icon</svg>,

  Users: () => <svg>Users Icon</svg>,

  User: () => <svg>User Icon</svg>,

  DollarSign: () => <svg>Dollar Sign Icon</svg>,

  Edit: () => <svg>Edit Icon</svg>,

}));
 
// Setup for testing smaller screen sizes

beforeEach(() => {

  global.innerWidth = 800; // Mock screen width as less than 1024

  vi.clearAllMocks();

});
 
describe("ArtistSidebar", () => {

  it("renders sidebar and links", () => {

    render(
<MemoryRouter>
<ArtistSidebar isOpen={true} toggleSidebar={() => {}} />
</MemoryRouter>

    );
 
    // Check if the sidebar elements are rendered

    expect(screen.getByText("Dashboard")).toBeInTheDocument();

    expect(screen.getByText("My Songs")).toBeInTheDocument();

    expect(screen.getByText("Add Songs")).toBeInTheDocument();

    expect(screen.getByText("Delete Songs")).toBeInTheDocument();

    expect(screen.getByText("Request Manager")).toBeInTheDocument();

    expect(screen.getByText("View My Manager")).toBeInTheDocument();

    expect(screen.getByText("Royalty Transactions")).toBeInTheDocument();

    expect(screen.getByText("Update Profile")).toBeInTheDocument();  // This line checks the "Update Profile" text

  });
 
  it("displays icons correctly", () => {

    render(
<MemoryRouter>
<ArtistSidebar isOpen={true} toggleSidebar={() => {}} />
</MemoryRouter>

    );
 
    // Check if the icons are displayed correctly by their text content

    expect(screen.getByText("Home Icon")).toBeInTheDocument();

    expect(screen.getByText("Music Icon")).toBeInTheDocument();

    expect(screen.getByText("Plus Circle Icon")).toBeInTheDocument();

    expect(screen.getByText("Trash Icon")).toBeInTheDocument();

    expect(screen.getByText("Users Icon")).toBeInTheDocument();

    expect(screen.getByText("User Icon")).toBeInTheDocument();

    expect(screen.getByText("Dollar Sign Icon")).toBeInTheDocument();

    expect(screen.getByText("Edit Icon")).toBeInTheDocument();  // This line checks the "Edit Icon"

  });
 
  it("calls toggleSidebar when a link is clicked and screen width is less than 1024", () => {

    // Create a mock function to test toggleSidebar

    const toggleSidebarMock = vi.fn();
 
    // Render the sidebar with the mock function

    render(
<MemoryRouter>
<ArtistSidebar isOpen={true} toggleSidebar={toggleSidebarMock} />
</MemoryRouter>

    );
 
    // Click on the 'Dashboard' link

    fireEvent.click(screen.getByText("Dashboard"));
 
    // Check if toggleSidebar was called (since screen width is less than 1024)

    expect(toggleSidebarMock).toHaveBeenCalledTimes(1);

  });
 
  it("ensures all NavLinks are clickable", () => {

    const toggleSidebarMock = vi.fn();
 
    // Render the component

    render(
<MemoryRouter>
<ArtistSidebar isOpen={true} toggleSidebar={toggleSidebarMock} />
</MemoryRouter>

    );
 
    // Check if the links are clickable

    fireEvent.click(screen.getByText("Dashboard"));

    fireEvent.click(screen.getByText("My Songs"));

    fireEvent.click(screen.getByText("Add Songs"));

    fireEvent.click(screen.getByText("Delete Songs"));

    fireEvent.click(screen.getByText("Request Manager"));

    fireEvent.click(screen.getByText("View My Manager"));

    fireEvent.click(screen.getByText("Royalty Transactions"));

    fireEvent.click(screen.getByText("Update Profile"));
 
    // Check if toggleSidebar was called for each link (as expected screen size < 1024)

    expect(toggleSidebarMock).toHaveBeenCalledTimes(8);  // 8 times for each link

  });

});
 