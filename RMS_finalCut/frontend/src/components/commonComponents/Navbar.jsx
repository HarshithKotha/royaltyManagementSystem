import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/authContext";
import { useNavigate } from "react-router-dom";
import { FaUserCircle, FaBars, FaBell } from "react-icons/fa";
import Notifications from "../commonComponents/Notification";
import { useNotifications } from "../../context/NotificationContext";

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const profileRef = useRef(null);
  const notificationRef = useRef(null);
  const { unreadCount } = useNotifications();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Function to handle profile button click
  const toggleProfile = () => {
    setShowProfile((prev) => !prev);
    setShowNotifications(false); // Close notifications when opening profile
  };

  // Function to handle notifications button click
  const toggleNotifications = () => {
    setShowNotifications((prev) => !prev);
    setShowProfile(false); // Close profile when opening notifications
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !profileRef.current?.contains(event.target) &&
        !notificationRef.current?.contains(event.target)
      ) {
        setShowProfile(false);
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex items-center justify-between h-16 bg-teal-600 px-5 relative">
      <button onClick={toggleSidebar} className="text-white text-2xl cursor-pointer lg:hidden">
        <FaBars />
      </button>
      <p className="text-xl font-bold text-white">Welcome, {user ? user?.username : "Guest"}</p>

      <div className="flex items-center space-x-6 relative">
        {user && (user?.role === "Artist" || user?.role === "Manager") && (
          <button onClick={toggleNotifications} className="relative text-white text-2xl cursor-pointer">
            <FaBell />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-red-600 text-white text-xs rounded-full px-1">
                {unreadCount}
              </span>
            )}
          </button>
        )}
        <button onClick={toggleProfile} className="text-white text-2xl cursor-pointer">
          <FaUserCircle />
        </button>
        <button 
          onClick={handleLogout} 
          className="px-4 py-1 bg-teal-700 hover:bg-teal-800 text-white rounded cursor-pointer"
        >
          Logout
        </button>
      </div>

      {showNotifications && (
        <div ref={notificationRef} className="absolute right-0 top-16 z-50">
          <Notifications />
        </div>
      )}

      {showProfile && user && (
        <div 
          ref={profileRef} 
          className="absolute right-6 top-16 bg-white shadow-lg rounded-lg p-5 w-72 z-50 border border-gray-200 animate-fade-in"
        >
          <h3 className="text-lg font-semibold border-b pb-2 mb-3 text-gray-700">Profile Details</h3>
          <p className="text-sm text-gray-600"><strong>Name:</strong> {user?.username}</p>
          <p className="text-sm text-gray-600"><strong>Email:</strong> {user?.email}</p>
          <p className="text-sm text-gray-600"><strong>Role:</strong> {user?.role}</p>
        </div>
      )}
    </div>
  );
};

export default Navbar;
