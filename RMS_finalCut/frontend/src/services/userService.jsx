import axios from "axios";

const API_BASE_URL = "http://localhost:5005/api/users";

// Create new user
export const createUser = async (formData) => {
  try {
    const formattedData = {
      ...formData,
      role: formData.role.charAt(0).toUpperCase() + formData.role.slice(1).toLowerCase(),
    };

    const response = await axios.post(API_BASE_URL, formattedData,{
      headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
  });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to create user");
  }
};

// Fetch user details by username
export const fetchUserDetails = async (username) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${username}`,{
      headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
  });
    return response.data.user;
  } catch (error) {
    throw new Error("Failed to fetch user details");
  }
};

// Update user profile by username
export const updateUserProfile = async (username, formData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/${username}`, formData,{
      headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
  });
    return response.data;
  } catch (error) {
    throw new Error("Failed to update profile");
  }
};

// Fetch users by role
export const fetchUsersByRole = async (role) => {
  try {
      const response = await axios.get(`${API_BASE_URL}/role/${role}`,{
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
    });
      if (response.data.success) {
          return response.data.users;
      }
      throw new Error("Failed to fetch users");
  } catch (error) {
      throw new Error(error.message || "Error fetching users");
  }
};

// Toggle user active status
export const toggleUserStatus = async (userId, isActive) => {
  try {
      const response = await axios.put(`${API_BASE_URL}/toggle/${userId}`, { isActive },{
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
    });
      if (response.data.success) {
          return response.data.user;
      }
      throw new Error("Failed to toggle user status");
  } catch (error) {
      throw new Error(error.message || "Error toggling user status");
  }
};