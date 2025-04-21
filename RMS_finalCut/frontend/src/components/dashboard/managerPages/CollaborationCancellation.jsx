import React, { useEffect, useState } from "react";
import { fetchCollaborationsByUserAndRole, handleCancellationResponse } from "../../../services/CollaborationService";
import { useAuth } from "../../../context/authContext";
import { useNotifications } from "../../../context/NotificationContext";

const CollaborationCancellation = () => {
  const { userData } = useAuth();
  const { sendNotification } = useNotifications();
  const [collaborations, setCollaborations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollaborationRequests = async () => {
      if (!userData?._id) return;
      try {
        const fetchedCollaborations = await fetchCollaborationsByUserAndRole(userData?._id, "Manager");
        // Get all pending cancellation requests
        const pendingCollaborations = fetchedCollaborations.filter(
          (collab) => collab.status === "cancel_requested"
        );
        setCollaborations(pendingCollaborations);
      } catch (error) {
        console.error("Error fetching collaboration cancellation requests:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCollaborationRequests();
  }, [userData]);

  const handleDecision = async (collaborationId, artistId, decision) => {
    try {

      await handleCancellationResponse(collaborationId, decision);
      await sendNotification(
        artistId,
        `Your collaboration cancellation request has been ${decision}.`,
        "cancelCollaboration"
      );

      // Remove the handled request from UI
      setCollaborations((prev) => prev.filter((collab) => collab._id !== collaborationId));
    } catch (error) {
      console.error("Error handling cancellation response:", error);
    }

  };

  if (loading) return <p className="text-center p-6">Loading cancellation requests...</p>;
  if (collaborations.length === 0) return <p className="text-center p-6">No cancellation requests found.</p>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <header className="bg-white shadow-md py-4 px-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Collaboration Cancellation Requests</h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {collaborations.map((collaboration) => (
          <div key={collaboration._id} className="bg-white p-6 shadow-lg rounded-lg border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800">{collaboration.artistId?.fullName || "Unknown Artist"}</h3>
            <p className="text-gray-600"><strong>Email:</strong> {collaboration.artistId?.email || "N/A"}</p>
            <p className="text-gray-600"><strong>Reason:</strong> {collaboration.cancellationReason || "No reason provided"}</p>
            
            
            <div className="mt-4 flex justify-between">
              <button
                onClick={() => handleDecision(collaboration._id, collaboration.artistId?.artistId, "approved")}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 cursor-pointer"
              >
                Approve
              </button>
              <button
                onClick={() => handleDecision(collaboration._id, collaboration.artistId?.artistId, "declined")}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 cursor-pointer"
              >
                Decline
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>

  );

};

export default CollaborationCancellation;
