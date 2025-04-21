import React from "react";
import { useAuth } from "../../../context/authContext";
import { FiUser, FiMail } from "react-icons/fi"; // Import icons

const ViewAdminForm = () => {
  const { user } = useAuth();

  return (
    <div className="bg-gradient-to-br from-gray-200 to-gray-100 min-h-screen flex justify-center items-center p-6">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-lg border border-gray-300">
        
        {/* Profile Image */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center text-3xl font-semibold text-white">
            {user.username?.charAt(0).toUpperCase()}
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mt-3">Admin Profile</h1>
        </div>

        <form className="space-y-6">
          {/* Name Field */}
          <div className="flex items-center gap-3 border-b pb-2">
            <FiUser className="text-gray-500 text-lg" />
            <div className="w-full">
              <label className="block text-gray-600 text-sm font-semibold">User Name</label>
              <p className="text-gray-900 font-medium text-lg">{user.username}</p>
            </div>
          </div>

          {/* Email Field */}
          <div className="flex items-center gap-3 border-b pb-2">
            <FiMail className="text-gray-500 text-lg" />
            <div className="w-full">
              <label className="block text-gray-600 text-sm font-semibold">Email</label>
              <p className="text-gray-900 font-medium text-lg">{user.email}</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ViewAdminForm;