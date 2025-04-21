import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
 
const AuthContext = createContext();
 
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null); // Store logged-in user data
    const [loading, setLoading] = useState(true);
 
    const verifyUser = async () => {
        const token = sessionStorage.getItem("token");
        if (token) {
            try {
                const response = await axios.get("http://localhost:5001/api/auth/verify", {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });
 
                if (response.data.success) {
                    const loggedInUser = response.data.user;
                    setUser(loggedInUser);
 
                    if (loggedInUser.role !== "Admin") {
                        await fetchRoleData(loggedInUser);
                    }
                }
            } catch (error) {
                console.error("Verification failed:", error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        } else {
            setUser(null);
            setLoading(false);
        }
    };
 
    const fetchRoleData = async (loggedInUser) => {
        try {
            const response = await axios.get(`http://localhost:5005/api/users/${loggedInUser.username}`,{
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${sessionStorage.getItem("token")}`,
                },
            });
            if (response.data.success) {
                setUserData(response.data.user);
            }
        } catch (error) {
            console.error("Error fetching role data:", error);
        }
    };
 
    const login = async (data, token) => {
        try {
            sessionStorage.setItem("token", token);
            setUser(data); // Set user state immediately after login
            await verifyUser(); // Trigger verification after login
        } catch (error) {
            console.error("Verification failed:", error);
            setUser(null);
        }
    };
 
    const logout = () => {
        setUser(null);
        setUserData(null);
        sessionStorage.removeItem("token");
    };
 
    // Verify the user on mount
    useEffect(() => {
        verifyUser();
    }, []);
 
    return (
        <AuthContext.Provider value={{ user, userData, login, logout, loading,setUserData }}>
            {children}
        </AuthContext.Provider>
    );
};
 
export const useAuth = () => useContext(AuthContext);