import React, { useState } from "react";
import SearchBar from "../../commonComponents/SearchBar";
 
const ManagersTable = ({ managers }) => {
    const [searchTerm, setSearchTerm] = useState("");
 
    const filteredManagers = managers.filter((manager) =>
        manager.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
 
    return (
        <div className="mt-8">
            <h3 className="text-lg font-bold mb-2">All Managers</h3>
            <SearchBar onSearch={setSearchTerm} />
            <div className="overflow-x-auto mt-4">
                <table className="min-w-full border-collapse border border-gray-300">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="border border-gray-300 px-4 py-2">Manager Name</th>
                            <th className="border border-gray-300 px-4 py-2">Total Streams</th>
                            <th className="border border-gray-300 px-4 py-2">Total Royalty</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredManagers.length > 0 ? (
                            filteredManagers.map((manager, index) => (
                                <tr key={index} className="border border-gray-300">
                                    <td className="border px-4 py-2">{manager.name}</td>
                                    <td className="border px-4 py-2">{manager.totalStreams}</td>
                                    <td className="border px-4 py-2">{`$ ${manager.totalRoyalty.toFixed(2)}`}</td>
                                </tr>
                            ))
                            ):(
                            <tr>
                                <td colSpan="3" className="text-center py-2">
                                    No manager found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
 
export default ManagersTable;