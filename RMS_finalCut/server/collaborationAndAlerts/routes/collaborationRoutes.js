const express = require('express');
const router = express.Router();
const collaborationController = require('../controllers/collaborationController');
const { verifyUser } = require('../middleware/authMiddleware');

 
router.post('/', verifyUser,collaborationController.createCollaboration);
 
router.get('/:userId/:role', verifyUser,collaborationController.getCollaborationsByUserAndRole);
 
router.put('/:collaborationId',verifyUser, collaborationController.updateCollaborationStatus);
 
router.put('/:collaborationId/cancel', verifyUser,collaborationController.cancelCollaboration);
 
router.put('/:collaborationId/cancel-response',verifyUser, collaborationController.handleCancellationResponse);
 
 
module.exports = router;