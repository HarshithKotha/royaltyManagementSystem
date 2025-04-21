import React, { useEffect, useState } from "react";
import { useArtistsManagers } from "../../../context/ArtistsManagersContext";
import { useRoyalty } from "../../../context/RoyaltyContext";
import TransactionService from "../../../services/TransactionService";
import TransactionList from "./TransactionList";
import CreateTransactionForm from "./CreateTransactionForm";

const Payments = () => {
    const { artists } = useArtistsManagers();
    const { royalties = [], selectedArtist, setSelectedArtist, fetchRoyaltyByArtist } = useRoyalty();

    const [selectedRoyalty, setSelectedRoyalty] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });

    
    const handleArtistChange = (event) => {
        const artistId = event.target.value;
        setSelectedArtist(artistId || "");
    };

    const handleCreateTransaction = (royalty) => {
        setSelectedRoyalty(royalty);
        setStatusMessage({ type: "", text: "" });
    };

    const loadTransactions = async (artistId) => {
        if (!artistId) {
            setStatusMessage({ type: "error", text: "No artist selected." });
            return;
        }

        const data = await TransactionService.fetchTransactions("artist", artistId);
        // const data = await TransactionService.fetchTransactions(artistId);
        setTransactions(data);
    };

    useEffect(() => {
        if (selectedArtist) {
            fetchRoyaltyByArtist(selectedArtist);
            loadTransactions(selectedArtist);
            setSelectedRoyalty(null);
        }
    }, [selectedArtist]);

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Manage Payments</h2>

            <label className="block mb-2">Select Artist:</label>
            <select className="border p-2 rounded w-full" onChange={handleArtistChange} value={selectedArtist || ""}>
                <option value="">-- Choose an Artist --</option>
                {artists.map((artist) => (
                    <option key={artist._id} value={artist._id}>{artist.fullName}</option>
                ))}
            </select>

            {statusMessage.text && (
                <div className={`mt-4 p-2 text-center rounded ${statusMessage.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {statusMessage.text}
                </div>
            )}

            {selectedArtist && royalties.length > 0 ? (
                <table className="mt-4 w-full border-collapse border border-gray-300">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="border p-2">Song Name</th>
                            <th className="border p-2">Total Royalty</th>
                            <th className="border p-2">Royalty Due</th>
                            <th className="border p-2">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {royalties.map((royalty) => (
                            <tr key={royalty._id} className="text-center">
                                <td className="border p-2">{royalty.songId?.songName || "N/A"}</td>
                                <td className="border p-2">${royalty.totalRoyalty?.toFixed(2) || 0}</td>
                                <td className="border p-2">${royalty.royaltyDue?.toString().split(".")[0] + "." + (royalty.royaltyDue?.toString().split(".")[1] || "00").slice(0, 2) || 0}</td>
                                <td className="border p-2">
                                    <button className="bg-blue-500 text-white px-3 py-1 rounded cursor-pointer"
                                        onClick={() => handleCreateTransaction(royalty)}>
                                        Create Transaction
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ): (
                <div className="mt-4 p-4 text-center text-gray-500">
                    No songs available to pay royalty.
                </div>
            )
        }

            {selectedRoyalty && (
                <CreateTransactionForm 
                    selectedRoyalty={selectedRoyalty} 
                    setSelectedRoyalty={setSelectedRoyalty} 
                    fetchTransactions={loadTransactions} 
                    selectedArtist={selectedArtist} 
                    setStatusMessage={setStatusMessage} 
                />
            )}

            <TransactionList 
                transactions={transactions} 
                fetchTransactions={loadTransactions} 
                setStatusMessage={setStatusMessage} 
                selectedArtist={selectedArtist} 
                fetchRoyaltyByArtist={fetchRoyaltyByArtist} // Pass the function
            />
        </div>
    );
};

export default Payments;
