import { Routes, Route } from "react-router-dom";
import ArtistDashboard from "../pages/ArtistDashboard";
import ArtistSummary from "../components/dashboard/artistPages/ArtistSummary";
import SongListPage from "../components/dashboard/artistPages/SongListPage";
import AddSongForm from "../components/dashboard/artistPages/AddSongForm";
import DeleteSong from "../components/dashboard/artistPages/DeleteSong";
import RequestManagerList from "../components/dashboard/artistPages/RequestManagerList";
import ViewMyManager from "../components/dashboard/artistPages/ViewMyManager";
import UpdateArtistProfileForm from "../components/dashboard/artistPages/updateArtistProfileForm";
import UserTransactions from "../components/commonComponents/UserTransactions";

const ArtistRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<ArtistDashboard />}>
        <Route index element={<ArtistSummary />} />
        <Route path="my-songs" element={<SongListPage />} />
        <Route path="add-songs" element={<AddSongForm />} />
        <Route path="delete-songs" element={<DeleteSong />} />
        <Route path="collaboration" element={<RequestManagerList />} />
        <Route path="view-manager" element={<ViewMyManager />} />
        <Route path="royalty-transactions" element={<UserTransactions />} />
        <Route path="update-profile" element={<UpdateArtistProfileForm />} />
      </Route>
    </Routes>
  );
};

export default ArtistRoutes;
