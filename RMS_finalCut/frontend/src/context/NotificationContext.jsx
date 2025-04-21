import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "./authContext";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = sessionStorage.getItem("token");
 

  useEffect(() => {
    if (user) {
      fetchNotifications(); // Initial fetch
      // setInterval to refresh notifications every 5 seconds only when user is active
      const interval = setInterval(() => {
        if (document.visibilityState === "visible") {
          fetchNotifications();
        }
      }, 5000);

      return () => clearInterval(interval); 
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`http://localhost:5004/api/notifications/${user._id}`,{
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });
      if (response.data?.success) {
        setNotifications(response.data?.notifications);
      }
    } catch (error) {
      console.error("Error fetching notifications", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`http://localhost:5004/api/notifications/${notificationId}`, { isRead: true },{
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

      // Remove the notification from the list
      setNotifications((prev) => prev?.filter((notif) => notif._id !== notificationId));
    } catch (error) {
      console.error("Error marking notification as read", error);
    }
  };

  const sendNotification = async (userId,messageToSend,msgType) => {
    const notificationData = {
      userId: userId, // Send to manager
      message: `${messageToSend}`,
      type: msgType,
    };
    try{
      await axios.post("http://localhost:5004/api/notifications/", notificationData,{
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });
    }
    catch (error) {
      console.error("Error in sending the notification", error);
    }
    
  };

  const unreadCount = notifications?.filter((notif) => !notif.isRead).length;

  return (
    <NotificationContext.Provider value={{ notifications, loading, markAsRead, unreadCount ,sendNotification}}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);