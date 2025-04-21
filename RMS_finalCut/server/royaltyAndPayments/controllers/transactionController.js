const { routeHandler } = require('ca-webutils/expressx');
const TransactionService = require('../services/transactionService');
const transactionService = new TransactionService();

const transactionController = {
    createTransaction: routeHandler(async ({ body }) => {
        const { userId, royaltyId, transactionAmount } = body;
        
        if (!userId || !royaltyId || !transactionAmount) {
            throw new Error("Missing required fields: userId, royaltyId, transactionAmount");
        }

        const transaction = await transactionService.createTransaction(body);
        return { 
            success: true, 
            message: "Transaction recorded successfully", 
            transaction 
        };
    }),

    getAllTransactions: routeHandler(async () => {
        const transactions = await transactionService.getAllTransactions();
        
        return { 
            success: true, 
            transactions 
        };
    }),

    getTransactionById: routeHandler(async ({ params }) => {
        const { userId } = params;
        const transaction = await transactionService.getTransactionById(userId);
        return { 
            success: true, 
            transaction 
        };
    }),

    getTransactionsByUserId: routeHandler(async ({ params }) => {
        const { userId, role } = params;
        const transactions = await transactionService.getTransactionsByUserId(userId, role);
        return transactions 
        
    }),

    deleteTransaction: routeHandler(async ({ params }) => {
        const { id } = params;
        await transactionService.deleteTransaction(id);
        return { 
            success: true, 
            message: "Transaction deleted successfully" 
        };
    }),

    payArtist: routeHandler(async ({ body }) => {
        const { transactionId, paymentAmount } = body;

        if (!transactionId || !paymentAmount) {
            throw new Error("Missing required fields: transactionId, paymentAmount");
        }

        const transaction = await transactionService.payArtist(transactionId, paymentAmount);
        return { 
            success: true, 
            message: "Payment processed successfully", 
            transaction 
        };
    }),

    exportTransactionsPDF : async (req, res) => {
        try {
          const { userId,role } = req.params; // Assuming transactions are user-specific
          const pdfBuffer = await transactionService.generateTransactionsPDF(userId,role);
         
          res.setHeader("Content-Type", "application/pdf");
          res.setHeader("Content-Disposition", 'attachment; filename="transactions.pdf"');
         
          res.send(pdfBuffer);
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
      },
};

module.exports = transactionController;