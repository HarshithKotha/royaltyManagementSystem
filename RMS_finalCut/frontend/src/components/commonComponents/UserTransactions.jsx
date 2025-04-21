import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/authContext";
import TransactionService from "../../services/TransactionService";

const UserTransactions = () => {
    const { user, userData, loading } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [walletAmount, setWalletAmount] = useState(0);

    useEffect(() => {
        const fetchArtistTransactions = async () => {
            setIsLoading(true);
            try {
                const fetchedTransactions = await TransactionService.fetchTransactions(user.role, userData._id);
                setTransactions(fetchedTransactions);

                const totalAmount = TransactionService.fetchWalletAmount(fetchedTransactions, user.role);
                setWalletAmount(totalAmount);
            } catch (error) {
                console.error("Error fetching artist transactions:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (!loading) fetchArtistTransactions();
    }, [userData, loading, user.role]);

    // Function to Download PDF
    const handleDownloadPDF = async () => {
        if (transactions.length === 0) {
            console.warn("No transactions available to download.");
            alert("No transactions available to download.");
            return;
        }
        try {
            const pdfBlob = await TransactionService.downloadTransactionsPDF(user.role, userData._id);
            const url = window.URL.createObjectURL(pdfBlob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "transactions.pdf";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } catch (error) {
            console.error("Error downloading PDF:", error);
        }
    };

    return (
        <div className="mt-6 px-4">
            <h3 className="text-2xl font-semibold text-gray-900 text-center mb-6">
                💰 Your Transactions
            </h3>

            {/* Wallet Display */}
            <div className="flex justify-center mb-6">
                <div className="bg-black text-white font-bold py-3 px-6 rounded-xl shadow-lg text-lg flex items-center gap-2">
                    🏦 Wallet Balance: <span className="text-2xl">${walletAmount.toFixed(2)}</span>
                </div>
            </div>

            {/* Download PDF Button */}
            <div className="flex justify-center mb-4">
                <button
                    onClick={handleDownloadPDF}
                    className="bg-gray-800 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all cursor-pointer"
                >   
                    📥 Download Transactions PDF
                </button>
            </div>

            {isLoading ? (
                <p className="text-gray-500 text-center animate-pulse">Loading transactions...</p>
            ) : transactions.length > 0 ? (
                <div className="bg-white shadow-md rounded-2xl overflow-hidden p-4">
                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-800 text-white">
                                    <th className="px-4 py-3 text-left font-medium">Transaction ID</th>
                                    <th className="px-4 py-3 text-left font-medium">Song Name</th>
                                    <th className="px-4 py-3 text-left font-medium">Amount</th>
                                    <th className="px-4 py-3 text-left font-medium">Artist Share</th>
                                    <th className="px-4 py-3 text-left font-medium">Manager Share</th>
                                    <th className="px-4 py-3 text-left font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((tx, index) => (
                                    <tr
                                        key={tx._id}
                                        className={`transition-all duration-300 ease-in-out border-b hover:bg-gray-100 
                                            ${index % 2 === 0 ? "bg-gray-50" : "bg-white"}`}
                                    >
                                        <td className="px-4 py-3 text-gray-800 font-medium truncate max-w-[150px]">
                                            {tx._id}
                                        </td>
                                        <td className="px-4 py-3 text-gray-700">{tx.songId?.songName || "N/A"}</td>
                                        <td className="px-4 py-3 text-green-600 font-semibold">
                                            ${tx.transactionAmount}
                                        </td>
                                        <td className="px-4 py-3 text-green-600 font-semibold">
                                            ${tx.artistShare.toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3 text-green-600 font-semibold">
                                            ${tx.managerShare.toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-md
                                                ${tx.status === "Approved" ? "bg-green-100 text-green-700" :
                                                tx.status === "Pending" ? "bg-yellow-100 text-yellow-700" :
                                                "bg-red-100 text-red-700"}`}>
                                                {tx.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden space-y-4">
                        {transactions.map((tx) => (
                            <div key={tx._id} className="bg-gray-50 p-4 rounded-lg shadow-sm">
                                <div className="flex justify-between items-center mb-2">
                                    <p className="text-sm font-medium text-gray-800">Transaction ID</p>
                                    <p className="text-sm text-gray-700 truncate max-w-[150px]">{tx._id}</p>
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                    <p className="text-sm font-medium text-gray-800">Song Name</p>
                                    <p className="text-sm text-gray-700">{tx.songId?.songName || "N/A"}</p>
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                    <p className="text-sm font-medium text-gray-800">Amount</p>
                                    <p className="text-sm text-green-600 font-semibold">${tx.transactionAmount}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <p className="text-gray-500 text-center">No transactions available</p>
            )}
        </div>
    );
};

export default UserTransactions;
