import React from "react";
import { useArtistsManagers } from "../../../context/ArtistsManagersContext";
import TopArtistsChart from "./TopArtistChart";
import TopManagersChart from "./TopManagerCharts";
import ArtistsTable from "./ArtistTable";
import ManagersTable from "./ManagerTable";
import SummaryCard from "../../commonComponents/SummaryCard";


const AdminSummary = () => {
    const { artists = [], managerStats = [] ,managers=[]} = useArtistsManagers();

    return (
        <div className="p-1 md:p-6 lg:p-6">
            <h2 className="text-2xl font-bold mb-4 p-3">Admin Dashboard</h2>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <SummaryCard title="Total Artists" value={artists.length} />
                <SummaryCard title="Total Managers" value={managers.length} />
            </div>

            {/* Charts Section */}
            <div className="flex flex-col gap-8">
                <div className="bg-white shadow-lg p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2 text-center">Top 5 Artists</h3>
                    <TopArtistsChart data={artists.slice(0, 5)} />
                </div>

                <div className="bg-white shadow-lg p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2 text-center">Top 5 Managers</h3>
                    <TopManagersChart data={managerStats.slice(0, 5)} />
                </div>
            </div>

            {/* Tables Section */}
            <div className="mt-8 flex flex-col gap-6">
                <ArtistsTable artists={artists} />
                <ManagersTable managers={managerStats} />
            </div>
        </div>
    );
};

export default AdminSummary;
