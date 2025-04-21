import React, { useState } from "react";
import { useAuth } from "../context/authContext";
import Navbar from "../components/commonComponents/Navbar.jsx";
import ArtistSidebar from "../components/dashboard/ArtistSidebar.jsx";
import { Outlet } from "react-router-dom";

const ArtistDashboard = () => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex">
      <ArtistSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className={`flex-1 ${isSidebarOpen ? 'ml-64' : 'lg:ml-64'} transition-margin duration-300 bg-gray-100 min-h-screen`}>
        <Navbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <Outlet /> {/* This will render the nested routes */}
      </div>
    </div>
  );
};

export default ArtistDashboard;