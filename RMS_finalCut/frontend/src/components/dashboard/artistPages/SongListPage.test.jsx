import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { expect, describe, it, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom";
import SongListPage from "./SongListPage";
import { useAuth } from "../../../context/authContext";
import SongService from "../../../services/SongService";
// Mocking useAuth hook
vi.mock("../../../context/authContext", () => ({
  useAuth: vi.fn(),
}));
// Mocking SongService
vi.mock("../../../services/SongService", () => {
  return {
    default: {
      fetchSongsByArtist: vi.fn(),
    },
    fetchSongsByArtist: vi.fn(),
  };
});
describe("SongListPage Component", () => {
  const mockUser = { _id: "123" };
  const mockUserData = { _id: "123", name: "Test Artist" };
  beforeEach(() => {
    vi.clearAllMocks();
 
    useAuth.mockReturnValue({
      user: mockUser,
      userData: mockUserData,
      loading: false,
    });
  });
  it("renders the loading state initially", () => {
    useAuth.mockReturnValueOnce({
      user: mockUser,
      userData: mockUserData,
      loading: true,
    });
    render(<SongListPage />);
    expect(screen.getByText("Loading songs...")).toBeInTheDocument();
  });
  it("fetches and displays songs after loading", async () => {
    const mockSongs = [
      {
        _id: "1",
        songName: "Melody of the Night",
        artistName: "Test Artist",
        totalStreams: 5000,
        totalRoyalty: 120.5,
        releaseDate: "2024-01-01",
      },
      {
        _id: "2",
        songName: "Sunset Harmony",
        artistName: "Test Artist",
        totalStreams: 3200,
        totalRoyalty: 80.75,
        releaseDate: "2024-02-01",
      },
    ];
    SongService.fetchSongsByArtist.mockResolvedValueOnce(mockSongs);
    render(<SongListPage />);
    await waitFor(() => expect(SongService.fetchSongsByArtist).toHaveBeenCalledTimes(1));
    expect(await screen.findByText("Melody of the Night")).toBeInTheDocument();
    expect(await screen.findByText("Sunset Harmony")).toBeInTheDocument();
  });
  it("displays 'No songs found.' when no songs are available", async () => {
    SongService.fetchSongsByArtist.mockResolvedValueOnce([]);
    render(<SongListPage />);
    await waitFor(() => expect(SongService.fetchSongsByArtist).toHaveBeenCalledTimes(1));
    expect(screen.getByText("No songs found.")).toBeInTheDocument();
  });
  it("filters songs based on search input", async () => {
    const mockSongs = [
      {
        _id: "1",
        songName: "Melody of the Night",
        artistName: "Test Artist",
        totalStreams: 5000,
        totalRoyalty: 120.5,
        releaseDate: "2024-01-01",
      },
      {
        _id: "2",
        songName: "Sunset Harmony",
        artistName: "Test Artist",
        totalStreams: 3200,
        totalRoyalty: 80.75,
        releaseDate: "2024-02-01",
      },
    ];
    SongService.fetchSongsByArtist.mockResolvedValueOnce(mockSongs);
    render(<SongListPage />);
    await waitFor(() => expect(SongService.fetchSongsByArtist).toHaveBeenCalledTimes(1));
    // Ensure both songs are initially displayed
    expect(await screen.findByText("Melody of the Night")).toBeInTheDocument();
    expect(await screen.findByText("Sunset Harmony")).toBeInTheDocument();
    // Enter search term
    const searchInput = screen.getByPlaceholderText("Search here...");
    fireEvent.change(searchInput, { target: { value: "melody" } });
    // Ensure only "Melody of the Night" is displayed
    await waitFor(() => {
      expect(screen.getByText("Melody of the Night")).toBeInTheDocument();
      expect(screen.queryByText("Sunset Harmony")).not.toBeInTheDocument();
    });
  });
  it("handles API errors gracefully", async () => {
    SongService.fetchSongsByArtist.mockRejectedValueOnce(new Error("Failed to fetch"));
    render(<SongListPage />);
    await waitFor(() => expect(SongService.fetchSongsByArtist).toHaveBeenCalledTimes(1));
    expect(screen.getByText("No songs found.")).toBeInTheDocument();
  });
});