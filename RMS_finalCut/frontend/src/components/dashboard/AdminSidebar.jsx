import React from "react";
import { NavLink } from "react-router-dom";
import { 
  Home, 
  Users, 
  UserPlus, 
  DollarSign, 
  User 
} from "lucide-react"; // Importing icons

const AdminSidebar = ({ isOpen, toggleSidebar }) => {
  // Close the sidebar when a link is clicked (on mobile)
  const handleLinkClick = () => {
    if (window.innerWidth < 1024) {
      toggleSidebar();
    }
  };

  return (
    <div
      className={`bg-gray-900 text-white h-screen fixed left-0 top-0 bottom-0 w-64 transform 
      ${isOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300 lg:translate-x-0 shadow-lg`}
    >
      {/* Sidebar Header */}
      <div className="bg-teal-600 h-16 flex items-center justify-center text-3xl font-bold uppercase tracking-wide shadow-md">
        <h3 className="text-3xl font-pacific text-center">RMS</h3>
      </div>

      {/* Sidebar Links */}
      <div className="px-4 py-4 space-y-2">
        <NavLink
          to="/admin-dashboard"
          end
          onClick={handleLinkClick}
          className={({ isActive }) =>
            `flex items-center space-x-3 py-3 px-5 rounded-lg transition-all duration-200 
            ${isActive ? "bg-teal-600 shadow-md scale-105" : "hover:bg-gray-700"}`
          }
        >
          <Home size={20} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/admin-dashboard/create-user-account"
          onClick={handleLinkClick}
          className={({ isActive }) =>
            `flex items-center space-x-3 py-3 px-5 rounded-lg transition-all duration-200 
            ${isActive ? "bg-teal-600 shadow-md scale-105" : "hover:bg-gray-700"}`
          }
        >
          <UserPlus size={20} />
          <span>Create User Account</span>
        </NavLink>

        <NavLink
          to="/admin-dashboard/delete-users"
          onClick={handleLinkClick}
          className={({ isActive }) =>
            `flex items-center space-x-3 py-3 px-5 rounded-lg transition-all duration-200 
            ${isActive ? "bg-teal-600 shadow-md scale-105" : "hover:bg-gray-700"}`
          }
        >
          <Users size={20} />
          <span>Manage Users</span>
        </NavLink>

        <NavLink
          to="/admin-dashboard/payments"
          onClick={handleLinkClick}
          className={({ isActive }) =>
            `flex items-center space-x-3 py-3 px-5 rounded-lg transition-all duration-200 
            ${isActive ? "bg-teal-600 shadow-md scale-105" : "hover:bg-gray-700"}`
          }
        >
          <DollarSign size={20} />
          <span>Payments</span>
        </NavLink>

        <NavLink
          to="/admin-dashboard/view-profile"
          onClick={handleLinkClick}
          className={({ isActive }) =>
            `flex items-center space-x-3 py-3 px-5 rounded-lg transition-all duration-200 
            ${isActive ? "bg-teal-600 shadow-md scale-105" : "hover:bg-gray-700"}`
          }
        >
          <User size={20} />
          <span>View My Profile</span>
        </NavLink>
      </div>
    </div>
  );
};

export default AdminSidebar;
