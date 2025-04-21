import React, { useState } from "react";
import { useAuth } from "../../../context/authContext";
import { useNotifications } from "../../../context/NotificationContext";
import SongService from "../../../services/SongService";

const AddSongForm = () => {
  const { userData } = useAuth();
  const { sendNotification } = useNotifications();
  const [formData, setFormData] = useState({ songName: "", releaseDate: "" });
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [songNameError, setSongNameError] = useState("");
  const [dateError, setDateError] = useState("");

  // Validate song name
  const validateSongName = (name) => {
    if (!name.trim()) return "Song name is required.";
    if (name.length < 3) return "Song name must be at least 3 characters long.";
    if (!/^[a-zA-Z0-9 ]+$/.test(name)) return "Song name can only contain letters, numbers, and spaces.";
    return "";
  };

  // Validate release date
  const validateReleaseDate = (date) => {
    if (!date) return "Release date is required.";
    const selectedDate = new Date(date);
    const today = new Date();
    if (selectedDate > today) return "Release date cannot be in the future.";
    return "";
  };

  // Handle input changes
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });

    if (id === "songName") setSongNameError(validateSongName(value));
    if (id === "releaseDate") setDateError(validateReleaseDate(value));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage(" ");
    setErrorMessage(" ");

    const songError = validateSongName(formData.songName);
    const dateError = validateReleaseDate(formData.releaseDate);
    
    if (songError || dateError) {
      setSongNameError(songError);
      setDateError(dateError);
      return;
    }

    if (!userData?._id) {
      setErrorMessage("User data not found. Please log in again.");
      return;
    }

    const newSong = {
      artistId: userData._id,
      artistName: userData.fullName,
      songName: formData.songName,
      releaseDate: formData.releaseDate,
    };

    try {
      const response = await SongService.addSong(newSong);
      if (response.success) {
        setSuccessMessage("Song added successfully! 🎵");
        setFormData({ songName: "", releaseDate: "" });
        setSongNameError("");
        setDateError("");

        if (userData?.manager?.managerId) {
          await sendNotification(
            userData.manager.managerId,
            `${userData.fullName} added a song: ${newSong.songName}.`,
            "songUpdate"
          );
        }
      } else {
        setErrorMessage("Failed to add song. Please try again.");
      }
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4">
      <header className="bg-white shadow-md py-4 px-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Add New Song</h1>
      </header>

      <div className="bg-white shadow-md rounded-lg p-6">
        {successMessage && <p className="text-green-700">{successMessage}</p>}
        {errorMessage && <p className="text-red-700">{errorMessage}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="songName" className="block text-gray-700">Song Name</label>
            <input
              type="text"
              id="songName"
              value={formData.songName}
              onChange={handleChange}
              className="border rounded w-full py-2 px-3"
            />
            {songNameError && <p className="text-red-500 text-xs">{songNameError}</p>}
          </div>
          <div className="mb-4">
            <label htmlFor="releaseDate" className="block text-gray-700">Release Date</label>
            <input
              type="date"
              id="releaseDate"
              value={formData.releaseDate}
              onChange={handleChange}
              className="border rounded w-full py-2 px-3"
            />
            {dateError && <p className="text-red-500 text-xs">{dateError}</p>}
          </div>
          <button
            type="submit"
            className="bg-teal-600 text-white font-bold py-2 px-4 rounded"
            disabled={!!songNameError || !!dateError}
          >
            Add Song
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddSongForm;