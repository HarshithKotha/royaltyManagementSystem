import axios from "axios";

const API_BASE_URL = "http://localhost:5003/api/transactions";

const TransactionService = {
    fetchTransactions: async (role, id) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/user/${role.toLowerCase()}/${id}`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${sessionStorage.getItem("token")}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching transactions:", error);
            return [];
        }
    },

    fetchWalletAmount: (transactions = [], role) => {
        return transactions.reduce((acc, tx) => acc + (role === "Artist" ? tx.artistShare || 0 : tx.managerShare || 0), 0);
    },

    downloadTransactionsPDF: async (role, id) => {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/export/${role.toLowerCase()}/${id}`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
                    },
                    responseType: "blob",
                }
            );
            return response.data;
        } catch (error) {
            throw new Error("Failed to download PDF");
        }
    },

    createTransaction: async (transactionData) => {
        try {
            await axios.post(API_BASE_URL, transactionData, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${sessionStorage.getItem("token")}`,
                },
            });
            return { success: true, message: "Transaction created successfully!" };
        } catch (error) {
            return { success: false, message: error.response?.data?.error || "Error creating transaction." };
        }
    },

    deleteTransaction: async (transactionId) => {
        try {
            await axios.delete(`${API_BASE_URL}/${transactionId}`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${sessionStorage.getItem("token")}`,
                },
            });
            return { success: true, message: "Transaction deleted successfully!" };
        } catch (error) {
            return { success: false, message: error.response?.data?.error || "Error deleting transaction." };
        }
    },

    payTransaction: async (transactionId, paymentAmount) => {
        try {
            await axios.post(`${API_BASE_URL}/pay`, { transactionId, paymentAmount }, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${sessionStorage.getItem("token")}`,
                },
            });
            return { success: true, message: "Payment successful!" };
        } catch (error) {
            return { success: false, message: error.response?.data?.error || "Error processing payment." };
        }
    }
};

export default TransactionService;
