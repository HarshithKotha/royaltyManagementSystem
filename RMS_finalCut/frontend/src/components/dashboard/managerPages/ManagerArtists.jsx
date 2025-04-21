import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/authContext";
import { fetchUserDetails } from "../../../services/userService"; // Import user service
import SearchBar from "../../commonComponents/SearchBar";

const ManagerArtists = () => {
  const [artists, setArtists] = useState([]);
  const [filteredArtists, setFilteredArtists] = useState([]);
  const { userData } = useAuth();

  useEffect(() => {
    const fetchArtists = async () => {
      if (!userData?.username) return; // Prevent API call if username is undefined

      try {
        const user = await fetchUserDetails(userData.username); // Fetch user details using the user service
        if (user?.managedArtists) {
          setArtists(user.managedArtists);
          setFilteredArtists(user.managedArtists);
        } else {
          setArtists([]);
          setFilteredArtists([]);
        }
      } catch (error) {
        console.error("Error fetching artists:", error);
        setArtists([]);
        setFilteredArtists([]);
      }
    };

    fetchArtists();
  }, [userData]); // Only trigger API call when userData updates

  // Search by artist name
  const handleSearch = (searchTerm) => {
    if (!searchTerm) {
      setFilteredArtists(artists);
    } else {
      setFilteredArtists(
        artists.filter((artist) =>
          artist.fullName.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header Section */}
      <header className="bg-white shadow-md py-4 px-6 mb-6 flex flex-col md:flex-row items-center justify-between rounded-lg">
        <h1 className="text-3xl font-bold text-gray-800">Managed Artists</h1>
        <SearchBar onSearch={handleSearch} />
      </header>

      {/* Artist Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArtists.length > 0 ? (
          filteredArtists.map((artist) => (
            <div
              key={artist._id}
              className="bg-white p-6 shadow-md rounded-2xl border border-gray-200 transition-all transform hover:scale-105 hover:shadow-xl"
            >
              {/* Artist Profile */}
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center text-2xl font-semibold text-gray-700">
                  {artist.fullName.charAt(0)}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mt-3">{artist.fullName}</h3>
              </div>

              {/* Artist Details */}
              <div className="mt-4 space-y-2 text-center sm:text-left">
                <p className="text-gray-600"><strong>Email:</strong> {artist.email}</p>
                <p className="text-gray-600"><strong>Mobile No:</strong> {artist.mobileNo}</p>
                <p className="text-gray-600"><strong>Address:</strong> {artist.address}</p>
                <p className="text-gray-600"><strong>Total Streams:</strong> {artist.totalStreams}</p>
                <p className="text-gray-600"><strong>Total Royalty:</strong> ${artist.fullRoyalty?.toFixed(2)}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-600 text-center col-span-3">No artists found.</p>
        )}
      </div>
    </div>
  );
};

export default ManagerArtists;
