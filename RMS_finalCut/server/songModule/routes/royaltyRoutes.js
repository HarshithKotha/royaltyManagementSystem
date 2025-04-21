const express = require('express');
const router = express.Router();
const { createRoyaltyController, getRoyaltyByIdController,getRoyaltyByArtistIdController } = require('../controllers/royaltyController');
const { verifyUser } = require('../middleware/authMiddleware');

// POST route to create royalty
router.post('/', verifyUser,createRoyaltyController);
 
// GET route to fetch royalty details by royaltyId
router.get('/:royaltyId',verifyUser, getRoyaltyByIdController);
 
router.get('/artists/:artistId', verifyUser,getRoyaltyByArtistIdController);
 
module.exports = router;