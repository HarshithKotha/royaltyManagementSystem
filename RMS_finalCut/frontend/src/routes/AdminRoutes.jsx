import { Routes, Route } from "react-router-dom";
import AdminDashboard from "../pages/AdminDashboard";
import AdminSummary from "../components/dashboard/adminPages/AdminSummary";
import CreateUserForm from "../components/dashboard/adminPages/CreateUserForm";
import DeleteUserForm from "../components/dashboard/adminPages/DeleteUserForm";
import ViewAdminForm from "../components/dashboard/adminPages/ViewAdminForm";
import AdminPayments from "../components/dashboard/adminPages/AdminPayments";

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminDashboard />}>
        <Route index element={<AdminSummary />} />
        <Route path="create-user-account" element={<CreateUserForm />} />
        <Route path="delete-users" element={<DeleteUserForm />} />
        <Route path="payments" element={<AdminPayments />} />
        <Route path="view-profile" element={<ViewAdminForm />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
