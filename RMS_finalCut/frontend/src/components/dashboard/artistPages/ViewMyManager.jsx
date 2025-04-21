import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../../context/authContext";
import { cancelCollaboration, fetchCollaborationsByUserAndRole } from "../../../services/CollaborationService";
import { useNotifications } from "../../../context/NotificationContext";

const ViewMyManager = () => {
  const { userData } = useAuth();
  const [collaborationId, setCollaborationId] = useState(null);
  const [showReasonBox, setShowReasonBox] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(""); 
  const { sendNotification } = useNotifications();
  const reasonBoxRef = useRef(null);

  useEffect(() => {
    //to get collaboration data and status of the artist
    const getCollaborationData = async () => {
      if (!userData?._id) return;
      try {
        const collaborations = await fetchCollaborationsByUserAndRole(userData._id, "Artist");
        if (collaborations?.length > 0) {
          setCollaborationId(collaborations[0]._id);
          setStatus(collaborations[0].status);
        }
      } catch (error) {
        console.error("Error fetching collaboration data:", error);
      }
    };

    getCollaborationData();
  }, [userData]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (reasonBoxRef?.current && !reasonBoxRef?.current?.contains(event.target)) {
        setShowReasonBox(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!userData?.manager) {
    return <p className="text-gray-600 p-6 text-center">No manager assigned.</p>;
  }

  const { fullName, email, mobileNo, address, commissionPercentage, managedArtists = [], description, managerId } =
    userData.manager??{};

  const handleCancelClick = () => {
    setShowReasonBox(true);
  };

  const handleReasonChange = (e) => {
    setCancelReason(e.target.value);
  };
  //make cancel collab api call and set states for all required fields 
  const handleSubmit = async () => {
    if (!cancelReason.trim() || !collaborationId) return;
    setIsSubmitting(true);
    try {
      await cancelCollaboration(collaborationId, cancelReason);
      await sendNotification(
        managerId,
        `The artist ${userData?.fullName} has requested to cancel the collaboration.`,
        "cancelCollaboration"
      );

      setStatus("cancel-requested"); // Updates UI to reflect request sent
      setShowReasonBox(false);
      setCancelReason("");
    } catch (error) {
      console.error("Error submitting cancel request", error);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen flex justify-center items-center">
      <div className="bg-white p-6 shadow-lg rounded-2xl border border-gray-200 max-w-lg w-full">
        <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center">Manager Details</h2>
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center text-2xl font-semibold text-gray-700">
            {fullName.charAt(0)}
          </div>
          <h3 className="text-2xl font-semibold text-gray-800">{fullName}</h3>
          <p className="text-gray-500">{description || "No description available"}</p>
        </div>

        <div className="mt-6 space-y-3">
          <p className="text-gray-600">
            <strong>Email:</strong> {email}
          </p>
          <p className="text-gray-600">
            <strong>Mobile No:</strong> {mobileNo}
          </p>
          <p className="text-gray-600">
            <strong>Address:</strong> {address}
          </p>
          <p className="text-gray-600">
            <strong>Commission Percentage:</strong> {commissionPercentage}%
          </p>
          <p className="text-gray-600">
            <strong>Number of Artists Managed:</strong> {managedArtists?.length}
          </p>
        </div>
        {/*Display message after request sent(i.e., status:cancel-requested) */}
        {/* if there is a collaboration then shown cancel button */}
        <div className="mt-6 flex flex-col items-center">
          {status === "cancel-requested" ? (
            <p className="mt-4 text-center font-semibold text-orange-600">
              Request sent for cancellation.
            </p>
          ):
           status === "Approved" ? (
            !showReasonBox && (
              <button
                onClick={handleCancelClick}
                className="bg-red-600 text-white px-4 py-2 rounded-xl shadow-md hover:bg-red-700 transition cursor-pointer"
              >
                Cancel Collaboration
              </button>
            )
          ) : null}


          {showReasonBox && (
            <div ref={reasonBoxRef} className="mt-4 w-full">
              <textarea
                className="p-2 border border-gray-300 rounded-md w-full"
                placeholder="Enter reason for cancellation..."
                value={cancelReason}
                onChange={handleReasonChange}
              />
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-xl shadow-md hover:bg-blue-700 transition w-full cursor-pointer"
              >
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewMyManager;
