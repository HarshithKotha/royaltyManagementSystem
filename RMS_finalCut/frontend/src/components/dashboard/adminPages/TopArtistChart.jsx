import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";

const TopArtistsChart = ({ data = [] }) => {
  if (!data.length) {
    return <div className="p-6 bg-white rounded-lg shadow-lg text-center text-gray-700">No Artist Data Available</div>;
  }

  // Function to abbreviate long names (e.g., "Johnathan Smith" → "J. Smith")
  const formatName = (name) => {
    const parts = name.split(" ");
    return parts.length > 1 ? `${parts[0][0]}. ${parts[1]}` : name; // "J. Smith"
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Top Artists Performance</h2>

      {/* Side-by-Side Layout for Charts */}
      <div className="grid md:grid-cols-2 gap-8">
        
        {/* Total Streams - Bar Chart */}
        <div className="p-4 bg-gray-100 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-center mb-3 text-gray-700">Total Streams</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
              <XAxis 
                dataKey="fullName" 
                tickFormatter={formatName}  // Abbreviates long names
                interval={0}  // Show all names
                angle={-15}   // Slight tilt to prevent merging
                tick={{ fontSize: 12, fill: "#333" }} 
                tickMargin={10} 
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="totalStreams" fill="#4F46E5" name="Total Streams" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Full Royalty - Line Chart */}
        <div className="p-4 bg-gray-100 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-center mb-3 text-gray-700">Full Royalty Earned</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
              <XAxis 
                dataKey="fullName" 
                tickFormatter={formatName}  // Abbreviates long names
                interval={0}  // Show all names
                angle={-15}   // Slight tilt
                tick={{ fontSize: 12, fill: "#333" }} 
                tickMargin={10} 
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="fullRoyalty" stroke="#10B981" name="Full Royalty" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
};

export default TopArtistsChart;
