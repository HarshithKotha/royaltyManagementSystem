import axios from "axios";

const API_BASE_URL = "http://localhost:5004/api/collaborations";

// Fetch collaboration requests for a manager
export const fetchCollaborationRequests = async (managerId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${managerId}/Manager`,{
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    });
    return response.data?.collaborations || [];
  } catch (error) {
    console.error("Error fetching collaboration requests:", error);
    throw error;
  }
}
// Accept a collaboration request

export const handleCollaborationRequest = async (requestId,reason) => {
  try {
    await axios.put(`${API_BASE_URL}/${requestId}`, { status: reason },{
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    });
  } catch (error) {
    console.error("Error accepting collaboration request:", error);
    throw error;
  }
};


// Send a collaboration request
export const sendCollaborationRequest = async (artistId, managerId) => {
  try {
    const response = await axios.post(API_BASE_URL, {
      collaborationId: Math.random().toString(36).substring(2, 9),
      artistId,
      managerId,
    },{
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    });
    return response?.data;
  } catch (error) {
    console.error("Error sending collaboration request:", error);
    throw error;
  }
};


// Cancel a collaboration
export const cancelCollaboration = async (collaborationId, reason) => {
  try {
 
    await axios.put(`${API_BASE_URL}/${collaborationId}/cancel`, { reason }, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    });
  } catch (error) {
    console.error("Error canceling collaboration:", error);
    throw error;
  }
};

// Handle collaboration cancellation response
export const handleCancellationResponse = async (collaborationId, response) => {
 
  try {
    await axios.put(`${API_BASE_URL}/${collaborationId}/cancel-response`, { response }, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    });
  
  } catch (error) {
    console.error("Error handling cancellation response:", error);
    throw error;
  }
};

// Fetch collaborations by userId and role
export const fetchCollaborationsByUserAndRole = async (userId, role) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${userId}/${role}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    });
   
    return response.data?.collaborations || [];
  } catch (error) {
    console.error("Error fetching collaborations:", error);
    throw error;
  }
};