import React from "react";
import { useNotifications } from "../../context/NotificationContext";

const Notifications = () => {
  const { notifications, loading, markAsRead } = useNotifications();

  return (
    <div className="absolute right-4 bg-white shadow-lg rounded-lg p-4 w-80 z-50 border border-gray-200">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Notifications</h3>
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : notifications?.length === 0 ? (
        <p className="text-gray-500">No new notifications</p>
      ) : (
        <ul className="space-y-2">
          {notifications.map((notif) => (
            
            <li 
              key={notif?._id}
              className="flex justify-between items-center p-3 border rounded bg-gray-100 hover:bg-gray-200 transition"
            >
              <p className="text-gray-800 text-sm">{notif?.message}</p>
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded shadow"
                onClick={() => markAsRead(notif?._id)}
              >
                Mark as Read
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notifications;
