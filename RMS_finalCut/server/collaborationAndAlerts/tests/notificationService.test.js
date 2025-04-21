const sinon = require('sinon');
const mongoose = require('mongoose');
const { expect } = require('chai');
const NotificationService = require('../services/notificationService');
const NotificationRepository = require('../repositories/notificationRepository');

describe('Notification Service - createNotification', function () {
  let notificationService;
  let notificationRepository;

  // Set timeout for all tests in this suite
  this.timeout(10);

  beforeEach(() => {
 
    notificationRepository = {
      create: sinon.stub()
    };
 
    notificationService = new NotificationService(notificationRepository);
  });

  

  it('should throw an error when attempting to create a notification with missing required fields', async () => {
    const invalidData = { type: 'royaltyPayment' };
    const expectedError = new Error('Notification validation failed: message: Path `message` is required., userId: Path `userId` is required.');
    
    notificationRepository.create.rejects(expectedError);

    try {
      await notificationService.createNotification(invalidData);
      expect.fail('Should have thrown an error');
    } catch (error) {
      expect(error.message).to.include('Notification validation failed');
      expect(error.message).to.include('message: Path `message` is required.');
      expect(error.message).to.include('userId: Path `userId` is required.');
    }
  });
});



describe('NotificationService', () => {
  let notificationService;
  let notificationRepository;

  beforeEach(() => {
    // Create a repository stub with all required methods
    notificationRepository = {
      create: sinon.stub(),
      findByUserId: sinon.stub(),
      markAsReadAndDelete: sinon.stub()
    };
    
    // Create a new instance of service
    notificationService = new NotificationService();
    // Replace the repository instance
    notificationService.notificationRepository = notificationRepository;
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('getNotificationsByUser', () => {
    it('should get notifications by user id', async () => {
      // Arrange
      const userId = new mongoose.Types.ObjectId().toString();
      const expectedNotifications = [
        { _id: 'testId1', userId, message: 'Test 1' },
        { _id: 'testId2', userId, message: 'Test 2' }
      ];

      // Setup the stub
      notificationRepository.findByUserId.resolves(expectedNotifications);

      // Act
      const result = await notificationService.getNotificationsByUser(userId);

      // Assert
      expect(result).to.deep.equal(expectedNotifications);
      expect(notificationRepository.findByUserId.calledWith(userId)).to.be.true;
      expect(notificationRepository.findByUserId.calledOnce).to.be.true;
    });

    it('should return empty array when no notifications found', async () => {
      // Arrange
      const userId = new mongoose.Types.ObjectId().toString();
      notificationRepository.findByUserId.resolves([]);

      // Act
      const result = await notificationService.getNotificationsByUser(userId);

      // Assert
      expect(result).to.be.an('array').that.is.empty;
      expect(notificationRepository.findByUserId.calledWith(userId)).to.be.true;
    });

    it('should handle errors when getting notifications', async () => {
      // Arrange
      const userId = new mongoose.Types.ObjectId().toString();
      const error = new Error('Database error');
      notificationRepository.findByUserId.rejects(error);

      // Act & Assert
      try {
        await notificationService.getNotificationsByUser(userId);
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err).to.equal(error);
        expect(notificationRepository.findByUserId.calledWith(userId)).to.be.true;
      }
    });
  });
});


describe('NotificationService - markNotificationAsRead', () => {
  let notificationService;
  let notificationRepository;

  beforeEach(() => {
    // Create repository stub with required method
    notificationRepository = {
      markAsReadAndDelete: sinon.stub()
    };

    // Create service instance and inject repository stub
    notificationService = new NotificationService();
    notificationService.notificationRepository = notificationRepository;
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should successfully mark notification as read and delete it', async () => {
    // Arrange
    const notificationId = new mongoose.Types.ObjectId().toString();
    const expectedResult = {
      _id: notificationId,
      userId: new mongoose.Types.ObjectId().toString(),
      message: 'Test notification',
      isRead: true,
      type: 'royaltyPayment'
    };

    notificationRepository.markAsReadAndDelete.resolves(expectedResult);

    // Act
    const result = await notificationService.markNotificationAsRead(notificationId);

    // Assert
    expect(result).to.deep.equal(expectedResult);
    expect(notificationRepository.markAsReadAndDelete.calledOnce).to.be.true;
    expect(notificationRepository.markAsReadAndDelete.calledWith(notificationId)).to.be.true;
  });

  it('should return null when notification is not found', async () => {
    // Arrange
    const notificationId = new mongoose.Types.ObjectId().toString();
    notificationRepository.markAsReadAndDelete.resolves(null);

    // Act
    const result = await notificationService.markNotificationAsRead(notificationId);

    // Assert
    expect(result).to.be.null;
    expect(notificationRepository.markAsReadAndDelete.calledOnce).to.be.true;
    expect(notificationRepository.markAsReadAndDelete.calledWith(notificationId)).to.be.true;
  });

  it('should handle errors during mark as read operation', async () => {
    // Arrange
    const notificationId = new mongoose.Types.ObjectId().toString();
    const expectedError = new Error('Database error');
    notificationRepository.markAsReadAndDelete.rejects(expectedError);

    // Act & Assert
    try {
      await notificationService.markNotificationAsRead(notificationId);
      expect.fail('Should have thrown an error');
    } catch (error) {
      expect(error).to.equal(expectedError);
      expect(notificationRepository.markAsReadAndDelete.calledOnce).to.be.true;
      expect(notificationRepository.markAsReadAndDelete.calledWith(notificationId)).to.be.true;
    }
  });
});

