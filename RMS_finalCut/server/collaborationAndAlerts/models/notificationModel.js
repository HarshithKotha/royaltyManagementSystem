const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    type: {
      type: String,
      enum: ['royaltyPayment', 'collaborationRequest', 'profileUpdate','songUpdate','cancelCollaboration','trendingSong'], // Allowed types of notifications
      required: true
    },
  },
  { timestamps: true }
);
notificationSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  }
});
module.exports = mongoose.model('Notification', notificationSchema,'Notification');
