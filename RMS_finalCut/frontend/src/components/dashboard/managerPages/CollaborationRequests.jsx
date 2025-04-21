import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/authContext";
import { useNotifications } from "../../../context/NotificationContext";
import { fetchCollaborationRequests,handleCollaborationRequest} from "../../../services/CollaborationService"; // Import service functions

const CollaborationRequests = () => {
  const { userData } = useAuth();
  const [requests, setRequests] = useState([]);
  const { sendNotification } = useNotifications();

  useEffect(() => {
    const getRequests = async () => {
      if (!userData?._id) return;
      try {
        const fetchedRequests = await fetchCollaborationRequests(userData._id);
        const pendingRequests = fetchedRequests.filter(
          (collab) => collab.status === "Pending"
        );
        setRequests(pendingRequests);
      } catch (error) {
        console.error("Error fetching requests:", error);
      }
    };

    getRequests();
  }, [userData]);


  const handleResponse = async (requestId, artistId, response) => {
    try {
      await handleCollaborationRequest(requestId,response);
      setRequests((prevRequests) => prevRequests.filter((req) => req._id !== requestId));
      await sendNotification(artistId, `Your collaboration has been ${response} by ${userData?.fullName}.`, "collaborationRequest");
    } catch (error) {
      console.error("Error handling request:", error);
    }
  };



  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <header className="bg-white shadow-md py-4 px-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Collaboration Requests</h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {requests.length > 0 ? (
          requests.map((request) => (
            <div key={request._id} className="bg-white p-6 shadow-lg rounded-lg border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">{request.artistId?.fullName || "Unknown Artist"}</h3>
              <p className="text-gray-600 mt-2"><strong>Email:</strong> {request.artistId?.email || "N/A"}</p>
              <p className="text-gray-600"><strong>Mobile No:</strong> {request.artistId?.mobileNo || "N/A"}</p>
              <p className="text-gray-600"><strong>Description:</strong> {request.artistId?.description || "N/A"}</p>
             
              <div className="mt-4 flex justify-between">
                <button
                  onClick={() => handleResponse(request._id, request.artistId?.artistId,"Approved")}
                  className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 cursor-pointer"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleResponse(request._id, request.artistId?.artistId,"Rejected")}
                  className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 cursor-pointer"
                >
                  Reject
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-600">No collaboration requests found.</p>
        )}
      </div>
    </div>
  );
};

export default CollaborationRequests;
