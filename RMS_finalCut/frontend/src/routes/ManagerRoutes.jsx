import { Routes, Route } from "react-router-dom";
import ManagerDashboard from "../pages/ManagerDashboard";
import ManagerSummary from "../components/dashboard/managerPages/ManagerSummary";
import ManagerArtists from "../components/dashboard/managerPages/ManagerArtists";
import CollaborationRequests from "../components/dashboard/managerPages/CollaborationRequests";
import UpdateManagerProfileForm from "../components/dashboard/managerPages/UpdateManagerProfileForm";
import UserTransactions from "../components/commonComponents/UserTransactions";
import CollaborationCancellation from "../components/dashboard/managerPages/CollaborationCancellation"

const ManagerRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<ManagerDashboard />}>
        <Route index element={<ManagerSummary />} />
        <Route path="view-artists" element={<ManagerArtists />} />
        <Route path="collaboration-requests" element={<CollaborationRequests />} />
        <Route path="royalty-transactions" element={<UserTransactions />} />
        <Route path="update-profile" element={<UpdateManagerProfileForm />} />
        <Route path="cancel-collaboration" element={<CollaborationCancellation />} />
      </Route>
    </Routes>
  );
};

export default ManagerRoutes;
