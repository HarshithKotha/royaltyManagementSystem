import React, { useState, useEffect } from "react";
import TransactionService from "../../../services/TransactionService";
import { useNotifications } from "../../../context/NotificationContext";

const TransactionList = ({ transactions, fetchTransactions, setStatusMessage, selectedArtist, fetchRoyaltyByArtist }) => {
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const { sendNotification } = useNotifications();

    // Filter transactions to exclude those that are "Approved"
    useEffect(() => {
        setFilteredTransactions(transactions.filter(tx => tx.status !== "Approved"));
    }, [transactions]);

    const handlePayTransaction = async (transactionId, paymentAmount,artistShare,managerShare, songName, artistId,managerId) => {
        const confirmPayment = window.confirm("Are you sure you want to proceed with the payment?");
        if (!confirmPayment) return; // Stop if user cancels

        const response = await TransactionService.payTransaction(transactionId, paymentAmount);
        setStatusMessage({ type: response.success ? "success" : "error", text: response.message });

        if (response.success) {
            fetchTransactions(selectedArtist);  // Fetch updated transactions
            fetchRoyaltyByArtist(selectedArtist); // ✅ Ensure royalties update dynamically

            sendNotification(artistId, `Your transaction of $${artistShare.toFixed(2)} has been successfully processed for the song: ${songName}.`, "royaltyPayment");
            sendNotification(managerId, `Your transaction of $${managerShare.toFixed(2)} has been successfully processed for the song: ${songName}.`, "royaltyPayment");


            // Remove the paid transaction from UI immediately
            setFilteredTransactions(prevTransactions =>
                prevTransactions.filter(tx => tx._id !== transactionId)
            );
        }
    };

    const handleDeleteTransaction = async (transactionId) => {
        const response = await TransactionService.deleteTransaction(transactionId);
        setStatusMessage({ type: response.success ? "success" : "error", text: response.message });

        if (response.success) fetchTransactions(selectedArtist);
    };

    return (
        filteredTransactions.length > 0 && (
            <div className="mt-6">
                <h3 className="text-lg font-bold mb-2 text-center">Transactions</h3>

                {/* Table Layout for Larger Screens */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full min-w-max border-collapse border border-gray-300 text-sm">
                        <thead>
                            <tr className="bg-gray-200">
                                <th className="border p-2">Transaction ID</th>
                                <th className="border p-2">Song Name</th>
                                <th className="border p-2">Amount</th>
                                <th className="border p-2">Status</th>
                                <th className="border p-2">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTransactions.map((tx) => (
                                <tr key={tx._id} className="text-center">
                                    <td className="border p-2">{tx._id}</td>
                                    <td className="border p-2">{tx.songId?.songName || "N/A"}</td>
                                    <td className="border p-2">${tx.transactionAmount}</td>
                                    <td className="border p-2">{tx.status}</td>
                                    <td className="border p-2 flex flex-col gap-2 items-center sm:flex-row sm:justify-center">
                                        <button 
                                            className="bg-green-500 text-white text-xs px-3 py-1 rounded w-full sm:w-auto cursor-pointer"
                                            onClick={() => handlePayTransaction(tx._id, tx.transactionAmount,(tx.transactionAmount-((tx.transactionAmount*tx.userId.manager.commissionPercentage)/100)),(tx.transactionAmount*tx.userId.manager.commissionPercentage)/100, tx.songId?.songName || "Unknown Song", tx.userId?.artistId,tx.userId?.manager.managerId)}>
                                            Pay
                                        </button>
                                        <button
                                            className="bg-red-500 text-white text-xs px-3 py-1 rounded w-full sm:w-auto cursor-pointer"
                                            onClick={() => handleDeleteTransaction(tx._id)}>
                                            Cancel
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Card Layout for Mobile Screens */}
                <div className="md:hidden space-y-4">
                    {filteredTransactions.map((tx) => (
                        <div key={tx._id} className="bg-white p-4 rounded-lg shadow-md">
                            <div className="flex justify-between items-center mb-2">
                                <p className="text-sm font-medium text-gray-800">Transaction ID</p>
                                <p className="text-sm text-gray-700">{tx._id}</p>
                            </div>
                            <div className="flex justify-between items-center mb-2">
                                <p className="text-sm font-medium text-gray-800">Song Name</p>
                                <p className="text-sm text-gray-700">{tx.songId?.songName || "N/A"}</p>
                            </div>
                            <div className="flex justify-between items-center mb-2">
                                <p className="text-sm font-medium text-gray-800">Amount</p>
                                <p className="text-sm text-green-600 font-semibold">${tx.transactionAmount}</p>
                            </div>
                            <div className="flex justify-between items-center mb-2">
                                <p className="text-sm font-medium text-gray-800">Status</p>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-md
                                    ${tx.status === "Approved" ? "bg-green-100 text-green-700" :
                                    tx.status === "Pending" ? "bg-yellow-100 text-yellow-700" :
                                    "bg-red-100 text-red-700"}`}>
                                    {tx.status}
                                </span>
                            </div>
                            <div className="flex gap-2 mt-4">
                                <button 
                                    className="bg-green-500 text-white text-xs px-3 py-1 rounded w-full cursor-pointer"
                                    onClick={() => handlePayTransaction(tx._id, tx.transactionAmount,(tx.transactionAmount-((tx.transactionAmount*tx.userId.manager.commissionPercentage)/100)),(tx.transactionAmount*tx.userId.manager.commissionPercentage)/100, tx.songId?.songName || "Unknown Song", tx.userId?.artistId,tx.userId?.manager.managerId)}>
                                    Pay
                                </button>
                                <button
                                    className="bg-red-500 text-white text-xs px-3 py-1 rounded w-full cursor-pointer"
                                    onClick={() => handleDeleteTransaction(tx._id)}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    );
};

export default TransactionList;