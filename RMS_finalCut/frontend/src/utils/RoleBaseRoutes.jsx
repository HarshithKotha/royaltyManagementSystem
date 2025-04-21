import React from "react";
import { useAuth } from "../context/authContext";
import { Navigate } from "react-router-dom";

const RoleBaseRoutes = ({ children, requiredRole }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    // If the user is not authenticated, send them to login
    if (!user) {
        return <Navigate to="/login" />;
    }

    // If user role is not allowed, redirect them to login
    if (!requiredRole.includes(user.role)) {
        return <Navigate to="/login" />;
    }

    return children;
};

export default RoleBaseRoutes;
