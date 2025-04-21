import React, { useState } from "react";
import TransactionService from "../../../services/TransactionService";

const CreateTransactionForm = ({ selectedRoyalty, setSelectedRoyalty, fetchTransactions, selectedArtist, setStatusMessage }) => {
    const [transactionAmount, setTransactionAmount] = useState("");

    const handleTransactionSubmit = async (e) => {
        e.preventDefault();
        setStatusMessage({ type: "", text: "" });

        if (!transactionAmount || isNaN(transactionAmount) || transactionAmount <= 0) {
            setStatusMessage({ type: "error", text: "Enter a valid transaction amount!" });
            return;
        }

        if (parseFloat(transactionAmount) > selectedRoyalty.royaltyDue) {
           
            setStatusMessage({ type: "error", text: `Transaction amount cannot exceed the royalty due $${selectedRoyalty.royaltyDue.toFixed(2)}! `});
            return;
        }

        const transactionData = {
            userId: selectedArtist,
            songId: selectedRoyalty.songId?._id,
            royaltyId: selectedRoyalty._id,
            transactionAmount: parseFloat(transactionAmount),
        };

        const response = await TransactionService.createTransaction(transactionData);

        setStatusMessage({ type: response.success ? "success" : "error", text: response.message });

        if (response.success) {
            setSelectedRoyalty(null);
            setTransactionAmount("");
            fetchTransactions(selectedArtist);
        }
    };

    return (
        <div className="mt-6 p-4 border rounded bg-gray-100">
            <h3 className="text-lg font-bold mb-2">Create Transaction</h3>
            <form onSubmit={handleTransactionSubmit}>
                <input type="number" className="border p-2 rounded w-full mb-2"
                    value={transactionAmount} onChange={(e) => setTransactionAmount(e.target.value)} />
                <button type="submit" className="bg-green-500 text-white px-3 py-1 rounded cursor-pointer">Submit</button>
                <button type="button" className="bg-gray-400 text-white px-3 py-1 rounded ml-2 cursor-pointer" onClick={() => setSelectedRoyalty(null)}>Cancel</button>
            </form>
        </div>
    );
};

export default CreateTransactionForm;
