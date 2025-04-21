import React, { useState } from "react";
import SearchBar from "../../commonComponents/SearchBar";


const ArtistsTable = ({ artists = [] }) => {
    const [searchTerm, setSearchTerm] = useState("");

    // Filtering by search term
    const filteredArtists = artists.filter((artist) =>
        artist.fullName?.toLowerCase().includes(searchTerm.toLowerCase())|| (!artist.fullName && searchTerm === "")
    );

    return (
        <div className="mt-8">
            <h3 className="text-lg font-bold mb-2">All Artists</h3>
            <SearchBar onSearch={setSearchTerm} />
            <div className="overflow-x-auto mt-4">
                <table className="min-w-full border-collapse border border-gray-300">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="border border-gray-300 px-4 py-2">Artist Name</th>
                            <th className="border border-gray-300 px-4 py-2 text-center">Total Streams</th>
                            <th className="border border-gray-300 px-4 py-2 text-center">Total Royalty ($)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredArtists.length > 0 ? (
                            filteredArtists.map((artist, index) => (
                                <tr key={index} className="border border-gray-300">
                                    <td className="border px-4 py-2">{artist.fullName || "Unknown"}</td>
                                    <td className="border px-4 py-2 text-center">{artist.totalStreams || 0}</td>
                                    <td className="border px-4 py-2 text-center">
                                        ${(artist.fullRoyalty || 0).toFixed(2)}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" className="text-center py-2">
                                    No artists found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ArtistsTable;
