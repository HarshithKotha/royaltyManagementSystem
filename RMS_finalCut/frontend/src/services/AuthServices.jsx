import axios from "axios";

const API_URL = "https://authenticationmodule-4043.onrender.com/api/auth";

export const loginUser = async (email, password) => {
    try {
        // console.log("public ip",await getPublicIp())
        const response = await axios.post(`${API_URL}/login`, { email, password });
        return response.data; 
    } catch (error) {
        throw error.response?.data?.error || "Server Error";
    }
};

// Reset Password API call
export const resetPassword = async (id, token, password) => {
    try {
      const response = await axios.post(`${API_URL}/reset-password/${id}/${token}`, { password });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Server Error. Please try again later.";
    }
  };
  
  export const forgotPassword = async (email) => {
    try {
      const response = await axios.post(`${API_URL}/forgot-password`, { email });
      return response.data;
    } catch (err) {
      throw err.response?.data?.message || "Server error. Please try again later.";
    }
  };
