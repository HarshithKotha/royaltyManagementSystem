import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/authContext";
import SearchBar from "../../commonComponents/SearchBar";
import SongService from "../../../services/SongService";

const SongListPage = () => {
    const [songs, setSongs] = useState([]);
    const [filteredSongs, setFilteredSongs] = useState([]);
    const { user, userData, loading } = useAuth();

    useEffect(() => {
        if (loading || !user || !userData) return;

        const fetchSongs = async () => {
            try {
                const fetchedSongs = await SongService.fetchSongsByArtist(userData._id);
                setSongs(fetchedSongs);
                setFilteredSongs(fetchedSongs);
            } catch (error) {
                console.error("Failed to fetch songs:", error);
            }
        };

        fetchSongs();
    }, [userData, loading]);

    const handleSearch = (searchTerm) => {
        if (!searchTerm) {
            setFilteredSongs(songs);
        } else {
            setFilteredSongs(songs.filter(song => song.songName.toLowerCase().includes(searchTerm.toLowerCase())));
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen p-4">
            {loading ? (
                <p className="text-center text-gray-600">Loading songs...</p>
            ) : (
                <>
                    <header className="bg-white shadow-md py-4 px-6 mb-6 flex flex-col md:flex-row items-center justify-between">
                        <h1 className="text-2xl font-bold text-gray-800">Your Songs</h1>
                        <SearchBar onSearch={handleSearch} />
                    </header>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredSongs.length > 0 ? (
                            filteredSongs.map((song) => (
                                <div key={song._id} className="bg-white p-6 rounded-lg shadow-lg">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-bold text-lg">{song.songName}</p>
                                            <p className="text-sm text-gray-600">{song.artistName}</p>
                                        </div>
                                        <span className="px-2 py-1 text-sm rounded bg-blue-100 text-blue-600">
                                            {song.totalStreams} Streams
                                        </span>
                                    </div>
                                    <div className="mt-2 text-gray-600">Royalty: ${song.totalRoyalty.toFixed(2)}</div>
                                    <div className="mt-4 text-gray-600">Release Date: {new Date(song.releaseDate).toDateString()}</div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-600">No songs found.</p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default SongListPage;