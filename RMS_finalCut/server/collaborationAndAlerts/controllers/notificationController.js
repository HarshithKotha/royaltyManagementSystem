const { routeHandler } = require('ca-webutils/expressx');
const NotificationService = require('../services/notificationService');
const notificationService=new NotificationService();
 
const notificationController = {
    createNotification: routeHandler(async ({ body }) => {
        const notification = await notificationService.createNotification(body);
        return {success: true,notification};
    }),
 
    getNotificationsByUser: routeHandler(async ({ params }) => {
        const { userId } = params;
        const notifications = await notificationService.getNotificationsByUser(userId);
        return {success: true,notifications};
    }),
 
    markAsRead: routeHandler(async ({ params }) => {
        const { notificationId } = params;
        const notification = await notificationService.markNotificationAsRead(notificationId);
        return {success: true,notification};
    })
};
 
module.exports = notificationController;