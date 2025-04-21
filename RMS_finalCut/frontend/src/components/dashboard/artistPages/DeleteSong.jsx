import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/authContext";
import { useNotifications } from "../../../context/NotificationContext";
import SearchBar from "../../commonComponents/SearchBar";
import SongService from "../../../services/SongService";

const DeleteSong = () => {
  const [songs, setSongs] = useState([]);
  const [filteredSongs, setFilteredSongs] = useState([]);
  const [statusMessage, setStatusMessage] = useState("");
  const { userData } = useAuth();
  const { sendNotification } = useNotifications();

  // Fetch songs when the component loads or when userData changes
  useEffect(() => {
    if (!userData?._id) return;

    const fetchSongs = async () => {
      try {
        const fetchedSongs = await SongService.fetchSongsByArtist(userData._id);
        setSongs(fetchedSongs);
        setFilteredSongs(fetchedSongs); // Initially, set filteredSongs to all songs
      } catch (error) {
        console.error("Failed to fetch songs:", error);
      }
    };

    fetchSongs();
  }, [userData]);

  // Search functionality
  const handleSearch = (searchTerm) => {
    if (!searchTerm) {
      setFilteredSongs(songs); // If no search term, display all songs
    } else {
      setFilteredSongs(
        songs.filter((song) =>
          song.songName.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  };

  const handleDeleteSong = async (songId, songName) => {
    try {
      await SongService.deleteSong(songId);
  
      setSongs((prevSongs) => prevSongs.filter((song) => song.songId !== songId));
      setFilteredSongs((prevFilteredSongs) =>
        prevFilteredSongs.filter((song) => song.songId !== songId)
      );
  
      setStatusMessage("✅ Song deleted successfully!");
      setTimeout(() => setStatusMessage(""), 3000);

      if (userData?.manager?.managerId) {
        await sendNotification(
          userData.manager.managerId,
          `${userData.fullName} deleted a song: ${songName}.`,
          "songUpdate"
        );
      } else {
        console.warn("Manager data is missing. No notification sent.");
      }
      
    } catch (error) {
      setStatusMessage("❌ Failed to delete song.");
      console.error("Failed to delete song:", error);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      
      {/* Header with SearchBar */}
      <header className="bg-white shadow-md py-5 px-8 mb-8 flex flex-col md:flex-row items-center justify-between rounded-lg">
        <h1 className="text-3xl font-bold text-gray-800">Manage Songs</h1>
        <SearchBar onSearch={handleSearch} />
      </header>

      {/* Status Message */}
      {statusMessage && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md">
          {statusMessage}
        </div>
      )}

      {/* Songs displayed as responsive cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredSongs.length > 0 ? (
          filteredSongs.map((song) => (
            <div key={song._id} className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200">
              <p className="font-bold text-xl text-gray-800">{song.songName}</p>
              <p className="text-sm text-gray-500 mt-1">
                📅 Release Date: {new Date(song.releaseDate).toLocaleDateString()}
              </p>
              <p className="text-lg mt-3 text-gray-700">
                <b>🎧 Total Streams:</b> {song.totalStreams}
              </p>
              <p className="text-lg text-gray-700">
                <b>💰 Total Royalty:</b> ${song.totalRoyalty.toFixed(2)}
              </p>
              <div className="mt-6">
                <button
                  onClick={() => handleDeleteSong(song.songId, song.songName)}
                  className="w-full px-5 py-3 rounded-lg text-white font-semibold bg-red-500 hover:bg-red-600 transition-all duration-200 shadow-md hover:scale-105"
                >
                  🗑 Delete Song
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 text-lg">No songs found.</p>
        )}
      </div>
    </div>
  );
};

export default DeleteSong;
