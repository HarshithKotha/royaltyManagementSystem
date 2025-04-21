const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController'); // Ensure correct import path
const {verifyUser} = require('../middleware/authMiddleware')


// Define your routes here and associate them with controller functions
router.post('/', verifyUser, transactionController.createTransaction);   // Ensure controller is defined and imported
router.get('/', verifyUser, transactionController.getAllTransactions);  // Ensure controller is defined and imported
router.get('/:id', verifyUser, transactionController.getTransactionById); // Ensure controller is defined and imported
router.get('/user/:role/:userId', verifyUser,transactionController.getTransactionsByUserId); // Ensure controller is defined and imported
router.delete('/:id', verifyUser, transactionController.deleteTransaction); // Ensure controller is defined and imported

// Handle payment route
router.post('/pay', verifyUser,transactionController.payArtist); // Ensure controller is defined and imported
router.get("/export/:role/:userId", verifyUser,transactionController.exportTransactionsPDF);


module.exports = router;