const express = require('express');
const notificationController = require('../controllers/notificationController');
const { verifyUser } = require('../middleware/authMiddleware');


const router = express.Router();

// Create a new notification
router.post('/', verifyUser,notificationController.createNotification);

// Get all notifications for a user
router.get('/:userId',verifyUser, notificationController.getNotificationsByUser);

// Mark a notification as read
router.put('/:notificationId',verifyUser, notificationController.markAsRead);

module.exports = router;
