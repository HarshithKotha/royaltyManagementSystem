// notificationRepository.js
const Notification = require('../models/notificationModel'); // The Mongoose model

class NotificationRepository {
  // Create a new notification
  async create(notificationData) {
    const notification = new Notification(notificationData);
    return await notification.save(); // Save to DB
  }

  // Get notifications by user ID
  async findByUserId(userId) {
    return await Notification.find({ userId }); // Fetch from DB
  }

  // Mark notification as read and delete it
  async markAsReadAndDelete(notificationId) {
    try {
      const notification = await Notification.findByIdAndUpdate(
        notificationId,
        { isRead: true },
        { new: true }
      );
      if (!notification) return null;
      await Notification.findOneAndDelete({ _id: notificationId }); // Delete after marking as read
      return notification; // Return the updated notification
    }

    catch (error) {
      throw new Error(`${error.message}`);
    }
  }
}
module.exports = NotificationRepository;
