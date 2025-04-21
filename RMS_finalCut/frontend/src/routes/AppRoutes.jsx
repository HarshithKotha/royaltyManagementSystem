import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "../pages/HomePage";
import Login from "../pages/Login";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import PrivateRoutes from "../utils/PrivateRoutes";
import RoleBaseRoutes from "../utils/RoleBaseRoutes";

// Import grouped routes
import AdminRoutes from "./AdminRoutes";
import ArtistRoutes from "./ArtistRoutes";
import ManagerRoutes from "./ManagerRoutes";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home-page" />} />
      <Route path="/home-page" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:id/:token" element={<ResetPassword />} />

      {/* Admin Routes */}
      <Route
        path="/admin-dashboard/*"
        element={
          <PrivateRoutes>
            <RoleBaseRoutes requiredRole={["Admin"]}>
              <AdminRoutes />
            </RoleBaseRoutes>
          </PrivateRoutes>
        }
      />

      {/* Artist Routes */}
      <Route
        path="/artist-dashboard/*"
        element={
          <PrivateRoutes>
            <RoleBaseRoutes requiredRole={["Artist"]}>
              <ArtistRoutes />
            </RoleBaseRoutes>
          </PrivateRoutes>
        }
      />

      {/* Manager Routes */}
      <Route
        path="/manager-dashboard/*"
        element={
          <PrivateRoutes>
            <RoleBaseRoutes requiredRole={["Manager"]}>
              <ManagerRoutes />
            </RoleBaseRoutes>
          </PrivateRoutes>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
