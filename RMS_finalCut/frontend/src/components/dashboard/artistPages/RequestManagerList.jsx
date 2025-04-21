import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/authContext";
import { useNotifications } from "../../../context/NotificationContext";
import { useArtistsManagers } from "../../../context/ArtistsManagersContext";
import { sendCollaborationRequest, fetchCollaborationsByUserAndRole } from "../../../services/CollaborationService";
import SearchBar from "../../commonComponents/SearchBar";

const RequestManagerList = () => {
  const { userData } = useAuth();
  const { managers } = useArtistsManagers();
  const { sendNotification } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [pendingRequest, setPendingRequest] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [alreadyHasManager, setAlreadyHasManager] = useState(false);

  //check for the manager 
  useEffect(() => {
    if (userData?.manager) {
      setAlreadyHasManager(true);
    }
  }, [userData]);
  //Check for pending request
  useEffect(() => {
    if (!alreadyHasManager) {
      const fetchPendingRequest = async () => {
        try {
          setLoading(true);
          //check for colaborations of artist with pending status
          const collaborations = await fetchCollaborationsByUserAndRole(userData?._id, "artist");
          const pending = collaborations?.find(collab => collab.status === "Pending");
          setPendingRequest(pending || null);
        } catch (error) {
          console.error("Error fetching collaboration requests:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchPendingRequest();
    }
  }, [userData, alreadyHasManager]);

  const handleSendRequest = async (managerId, notifyManager) => {
    if (pendingRequest || alreadyHasManager) return;

    try {
      const response = await sendCollaborationRequest(userData._id, managerId);
      if (response?.success) {
        setPendingRequest({ managerId, status: "Pending" });
        await sendNotification(
          notifyManager,
          `${userData?.fullName} requested you for collaboration.`,
          "collaborationRequest"
        );
      }
    } catch (error) {
      console.error("Error sending collaboration request:", error);
    }
  };

  const filteredManagers = managers.filter((manager) =>
    manager.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        Available Managers
      </h1>

      <div className="flex justify-center mb-6">
        {/*setSearchTerm sets the state of searchTerm and used for filteredManagers*/}
        <SearchBar onSearch={setSearchTerm} />
      </div>
      {/*display message for artists already having manager*/}
      {alreadyHasManager && (
        <p className="mb-4 text-red-600 font-semibold text-center">
          You already have a manager! You cannot send new requests.
        </p>
      )}
      {/*display message for artists without manager but having pending request*/}
      {pendingRequest && !alreadyHasManager && (
        <p className="mb-4 text-red-600 font-semibold text-center">
          You already have a pending request. Wait for the manager to respond before sending another request. If there is no response for two days contact admin
        </p>
      )}

      {loading ? (
        <p className="text-center text-gray-600">Loading managers...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredManagers?.length > 0 ? (
            filteredManagers.map((manager) => (
              <div
                key={manager?._id}
                className="bg-white p-6 shadow-md rounded-2xl border border-gray-200 transition-transform transform hover:scale-105 hover:shadow-lg"
              >
                <h3 className="text-xl font-semibold text-gray-800 mb-3 text-center">
                  {manager?.fullName}
                </h3>

                <div className="space-y-3 text-gray-600">
                  <p><strong>Email:</strong> {manager?.email}</p>
                  <p><strong>Mobile No:</strong> {manager?.mobileNo}</p>
                  <p><strong>Address:</strong> {manager?.address}</p>
                  <p><strong>Commission Percentage:</strong> {manager?.commissionPercentage}%</p>
                  <p><strong>Managed Artists:</strong> {manager?.managedArtists?.length}</p>
                  <p><strong>Description:</strong> {manager?.description}</p>
                </div>
                {/*If artist dont have manager and pendingRequest show sendRequest button*/}
                {!alreadyHasManager && (
                  <div className="mt-6 flex flex-col items-center">
                    {!pendingRequest && (
                      <button
                        onClick={() => handleSendRequest(manager?._id, manager?.managerId)}
                        className="w-full px-4 py-2 text-white font-semibold rounded-lg transition-all duration-200 bg-blue-600 hover:bg-blue-700"
                      >
                        Send Request
                      </button>
                    )}
                    {/*If there is a pending request then for other managers other than requested manager disable the button*/}
                    {pendingRequest && pendingRequest?.managerId !== manager?._id && (
                      <button
                        className="w-full px-4 py-2 text-white font-semibold rounded-lg bg-gray-400 cursor-not-allowed"
                        disabled
                      >
                        Send Request
                      </button>
                    )}
                    {/*Display message for requested manager*/}
                    {pendingRequest && pendingRequest?.managerId === manager._id && (
                      <p className="mt-3 font-semibold text-green-600">Request Sent to this Manager</p>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-center text-gray-600 col-span-full">
              {searchTerm ? "No managers found." : "No managers available."}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default RequestManagerList;