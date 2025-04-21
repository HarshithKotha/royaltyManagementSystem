import React from "react";
import { NavLink } from "react-router-dom";
import { Home, Music, PlusCircle, Trash2, Users, User, DollarSign, Edit } from "lucide-react";

const ArtistSidebar = ({ isOpen, toggleSidebar }) => {
  const handleLinkClick = () => {
    if (window.innerWidth < 1024) {
      toggleSidebar();
    }
  };

  return (
    <div className={`bg-gray-900 text-white h-screen fixed left-0 top-0 bottom-0 w-64 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 lg:translate-x-0 shadow-lg`}>
      
      {/* Sidebar Header */}
      <div className="bg-teal-600 h-16 flex items-center justify-center text-3xl font-bold uppercase tracking-wide">
        <h3 className="text-white">RMS</h3>
      </div>

      {/* Sidebar Links */}
      <div className="px-4 py-4 space-y-2">
        <NavLink
          to="/artist-dashboard"
          end
          onClick={handleLinkClick}
          className={({ isActive }) => `${isActive ? "bg-teal-500" : ""} flex items-center space-x-3 py-3 px-4 rounded-lg hover:bg-gray-700 transition-all duration-200`}
        >
          <Home size={20} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/artist-dashboard/my-songs"
          onClick={handleLinkClick}
          className={({ isActive }) => `${isActive ? "bg-teal-500" : ""} flex items-center space-x-3 py-3 px-4 rounded-lg hover:bg-gray-700 transition-all duration-200`}
        >
          <Music size={20} />
          <span>My Songs</span>
        </NavLink>

        <NavLink
          to="/artist-dashboard/add-songs"
          onClick={handleLinkClick}
          className={({ isActive }) => `${isActive ? "bg-teal-500" : ""} flex items-center space-x-3 py-3 px-4 rounded-lg hover:bg-gray-700 transition-all duration-200`}
        >
          <PlusCircle size={20} />
          <span>Add Songs</span>
        </NavLink>

        <NavLink
          to="/artist-dashboard/delete-songs"
          onClick={handleLinkClick}
          className={({ isActive }) => `${isActive ? "bg-teal-500" : ""} flex items-center space-x-3 py-3 px-4 rounded-lg hover:bg-gray-700 transition-all duration-200`}
        >
          <Trash2 size={20} />
          <span>Delete Songs</span>
        </NavLink>

        <NavLink
          to="/artist-dashboard/collaboration"
          onClick={handleLinkClick}
          className={({ isActive }) => `${isActive ? "bg-teal-500" : ""} flex items-center space-x-3 py-3 px-4 rounded-lg hover:bg-gray-700 transition-all duration-200`}
        >
          <Users size={20} />
          <span>Request Manager</span>
        </NavLink>

        <NavLink
          to="/artist-dashboard/view-manager"
          onClick={handleLinkClick}
          className={({ isActive }) => `${isActive ? "bg-teal-500" : ""} flex items-center space-x-3 py-3 px-4 rounded-lg hover:bg-gray-700 transition-all duration-200`}
        >
          <User size={20} />
          <span>View My Manager</span>
        </NavLink>

        <NavLink
          to="/artist-dashboard/royalty-transactions"
          onClick={handleLinkClick}
          className={({ isActive }) => `${isActive ? "bg-teal-500" : ""} flex items-center space-x-3 py-3 px-4 rounded-lg hover:bg-gray-700 transition-all duration-200`}
        >
          <DollarSign size={20} />
          <span>Royalty Transactions</span>
        </NavLink>

        <NavLink
          to="/artist-dashboard/update-profile"
          onClick={handleLinkClick}
          className={({ isActive }) => `${isActive ? "bg-teal-500" : ""} flex items-center space-x-3 py-3 px-4 rounded-lg hover:bg-gray-700 transition-all duration-200`}
        >
          <Edit size={20} />
          <span>Update Profile</span>
        </NavLink>
      </div>
    </div>
  );
};

export default ArtistSidebar;
