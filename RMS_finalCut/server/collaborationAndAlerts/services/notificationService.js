const NotificationRepository = require('../repositories/notificationRepository'); 

class NotificationService {
  constructor() {
    this.notificationRepository = new NotificationRepository(); 
  }

  // Create a new notification
  async createNotification(notificationData) {
    return await this.notificationRepository.create(notificationData);
  }

  // Get notifications for a user
  async getNotificationsByUser(userId) {
    
    return await this.notificationRepository.findByUserId(userId);
  }

  // Mark notification as read and delete it
  async markNotificationAsRead(notificationId) {
    return await this.notificationRepository.markAsReadAndDelete(notificationId);
  }
}

module.exports = NotificationService;
