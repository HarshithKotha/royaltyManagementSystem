import axios from "axios";

const API_URL = "http://localhost:5002/api/songs/";

const SongService = {
  // 🔹 Add a new song
  addSong: async (newSong) => {
    try {
      const response = await axios.post(API_URL, newSong, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 400) {
        throw new Error("A song with the same name already exists.");
      } else {
        console.error("Failed to add song:", error);
        throw new Error("An error occurred while adding the song.");
      }
    }
  },

  // 🔹 Fetch songs by artist
  fetchSongsByArtist: async (artistId) => {
    try {
      const response = await axios.get(`${API_URL}artist/${artistId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });
      return response.data.songs;
    } catch (error) {
      console.error("Failed to fetch songs:", error);
      throw new Error("An error occurred while fetching songs.");
    }
  },

  // 🔹 Delete a song by ID
  deleteSong: async (songId) => {
    try {
      const response = await axios.delete(`${API_URL}${songId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Failed to delete song:", error);
      throw new Error("An error occurred while deleting the song.");
    }
  },
};

export default SongService;
