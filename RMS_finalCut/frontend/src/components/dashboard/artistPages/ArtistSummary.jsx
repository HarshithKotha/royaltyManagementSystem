import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/authContext";
import SummaryCard from "../../commonComponents/SummaryCard";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import SongService from "../../../services/SongService";

const ArtistSummary = () => {
  const { userData } = useAuth();
  const [songData, setSongData] = useState([]);

  useEffect(() => {
    if (!userData?._id) return;
  
    const fetchSongData = async () => {
      try {
        const fetchedSongs = await SongService.fetchSongsByArtist(userData._id);
        setSongData(fetchedSongs);
      } catch (error) {
        console.error("Failed to fetch song data:", error);
      }
    };
  
    fetchSongData();
    const interval = setInterval(fetchSongData, 60000); // Fetch data every 1 min
  
    return () => clearInterval(interval);
  }, [userData]);

  // Compute Summary Data
  const totalSongs = songData.length;
  const totalRoyalty = songData.reduce((sum, song) => sum + song.totalRoyalty, 0);
  const totalStreams = songData.reduce((sum, song) => sum + song.totalStreams, 0);
  const topSong = songData.reduce((top, song) => (song.totalStreams > (top?.totalStreams || 0) ? song : top), null);

  // Colors for the Pie Chart
  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#0088FE", "#00C49F"];

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Artist Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <SummaryCard title="Total Songs" value={totalSongs} />
        <SummaryCard title="Top Song" value={topSong ? topSong.songName : "N/A"} />
        <SummaryCard title="Total Royalty" value={`$${totalRoyalty.toFixed(2)}`} />
        <SummaryCard title="Total Streams" value={totalStreams} />
      </div>

      {/* Bar Chart - Top Performing Songs by Streams */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-lg font-semibold mb-4">Top Performing Songs by Streams</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={songData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <XAxis dataKey="songName" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="totalStreams" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Bar Chart - Top Performing Songs by Royalty */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-lg font-semibold mb-4">Top Earning Songs by Royalty</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={songData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <XAxis dataKey="songName" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="totalRoyalty" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Chart - Streams Distribution */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">Streams Distribution by Song</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={songData} dataKey="totalStreams" nameKey="songName" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
              {songData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ArtistSummary;