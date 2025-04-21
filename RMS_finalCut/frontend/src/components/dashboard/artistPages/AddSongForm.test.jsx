import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import AddSongForm from "./AddSongForm";
import { useAuth } from "../../../context/authContext";
import { useNotifications } from "../../../context/NotificationContext";
import SongService from "../../../services/SongService";
import "@testing-library/jest-dom";

vi.mock("../../../context/authContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../../../context/NotificationContext", () => ({
  useNotifications: vi.fn(),
}));

vi.mock("../../../services/SongService", () => ({
    default: {
      addSong: vi.fn(),
    },
  }));
  
  

describe("AddSongForm", () => {
  beforeEach(() => {
    useAuth.mockReturnValue({
      userData: {
        _id: "artist123",
        fullName: "Test Artist",
        manager: { managerId: "manager456" },
      },
    });

    useNotifications.mockReturnValue({ sendNotification: vi.fn() });
  });

//   test("renders the form correctly", async () => {
//     render(<AddSongForm />);
    
//     expect(screen.getByText("Add New Song")).toBeInTheDocument();
//     expect(screen.getByLabelText(/Song Name/i)).toBeInTheDocument();
//     expect(screen.getByLabelText(/Release Date/i)).toBeInTheDocument();

//     // Ensure the button is initially disabled
//     await waitFor(() => {
//         expect(screen.getByRole("button", { name: /Add Song/i })).toBeDisabled();
//       });
//   });

  test("validates song name input", async () => {
    render(<AddSongForm />);
    const songNameInput = screen.getByLabelText(/Song Name/i);

    fireEvent.change(songNameInput, { target: { value: "A" } });

    expect(
      await screen.findByText(/Song name must be at least 3 characters long/i)
    ).toBeInTheDocument();

    fireEvent.change(songNameInput, { target: { value: "Valid Song" } });

    await waitFor(() =>
      expect(
        screen.queryByText(/Song name must be at least 3 characters long/i)
      ).not.toBeInTheDocument()
    );
  });

  test("validates release date input", async () => {
    render(<AddSongForm />);
    const dateInput = screen.getByLabelText(/Release Date/i);

    fireEvent.change(dateInput, { target: { value: "2050-01-01" } });

    expect(
      await screen.findByText(/Release date cannot be in the future/i)
    ).toBeInTheDocument();

    fireEvent.change(dateInput, { target: { value: "2020-01-01" } });

    await waitFor(() =>
      expect(
        screen.queryByText(/Release date cannot be in the future/i)
      ).not.toBeInTheDocument()
    );
  });

  test("submits the form successfully", async () => {
    SongService.addSong.mockResolvedValue({ success: true });

    render(<AddSongForm />);
    fireEvent.change(screen.getByLabelText(/Song Name/i), {
      target: { value: "Valid Song" },
    });
    fireEvent.change(screen.getByLabelText(/Release Date/i), {
      target: { value: "2020-01-01" },
    });

    // Ensure the button is enabled before clicking
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Add Song/i })).not.toBeDisabled()
    );

    fireEvent.click(screen.getByRole("button", { name: /Add Song/i }));

    await waitFor(() =>
      expect(SongService.addSong).toHaveBeenCalledWith({
        artistId: "artist123",
        artistName: "Test Artist",
        songName: "Valid Song",
        releaseDate: "2020-01-01",
      })
    );

    expect(await screen.findByText(/Song added successfully/i)).toBeInTheDocument();
  });

  test("handles song submission failure", async () => {
    SongService.addSong.mockRejectedValue(new Error("Failed to add song"));

    render(<AddSongForm />);
    fireEvent.change(screen.getByLabelText(/Song Name/i), {
      target: { value: "Valid Song" },
    });
    fireEvent.change(screen.getByLabelText(/Release Date/i), {
      target: { value: "2020-01-01" },
    });

    // Ensure the button is enabled before clicking
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Add Song/i })).not.toBeDisabled()
    );

    fireEvent.click(screen.getByRole("button", { name: /Add Song/i }));

    await waitFor(() => expect(SongService.addSong).toHaveBeenCalled());
    expect(await screen.findByText(/Failed to add song/i)).toBeInTheDocument();
  });
});
