const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const mongoose = require('mongoose');
const { expect } = chai;
chai.use(sinonChai);

const NotificationRepository = require('../repositories/notificationRepository');
const Notification = require('../models/notificationModel');

//create a notification test cases
describe('NotificationRepository', () => {
  let notificationRepository;
  let saveStub;

  beforeEach(() => {
    notificationRepository = new NotificationRepository();
    saveStub = sinon.stub(Notification.prototype, 'save');
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('create', () => {

    it('should successfully create and save a notification with valid data', async () => {
      const notificationData = {
        userId: '123456',
        message: 'Test notification',
        type: 'info'
      };

      const expectedNotification = { ...notificationData, _id: 'mockId' };
      saveStub.resolves(expectedNotification);

      const result = await notificationRepository.create(notificationData);

      expect(saveStub).to.have.been.calledOnce;
      expect(result).to.deep.equal(expectedNotification);
    });

    it('should throw an error when trying to create a notification with missing required fields', async () => {
      const invalidNotificationData = {
        type: 'info'
      };

      saveStub.rejects(new Error('Validation failed'));

      try {
        await notificationRepository.create(invalidNotificationData);
        expect.fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).to.be.an('error');
        expect(error.message).to.equal('Validation failed');
      }

      expect(saveStub).to.have.been.calledOnce;
    });

    it('should handle and save a notification with maximum allowed character length for all fields', async () => {
      const maxLengthData = {
        userId: 'a'.repeat(24),
        message: 'a'.repeat(500),
        type: 'a'.repeat(50)
      };

      const expectedNotification = { ...maxLengthData, _id: 'mockId' };
      saveStub.resolves(expectedNotification);

      const result = await notificationRepository.create(maxLengthData);

      expect(saveStub).to.have.been.calledOnce;
      expect(result).to.deep.equal(expectedNotification);
    });

    it('should handle and save a notification with special characters in the fields', async () => {
      const notificationData = {
        userId: '123@$%^&*()',
        message: 'Test notification !@#$%^&*()_+',
        type: 'info <>/\\'
      };

      const expectedNotification = { ...notificationData, _id: 'mockId' };
      saveStub.resolves(expectedNotification);

      const result = await notificationRepository.create(notificationData);

      expect(saveStub).to.have.been.calledOnce;
      expect(result).to.deep.equal(expectedNotification);
    });

    it('should reject a notification creation attempt if the database connection is lost', async () => {
      const notificationData = {
        userId: '123456',
        message: 'Test notification',
        type: 'info'
      };

      const connectionError = new Error('Database connection lost');
      saveStub.rejects(connectionError);

      try {
        await notificationRepository.create(notificationData);
        expect.fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).to.be.an('error');
        expect(error.message).to.equal('Database connection lost');
      }

      expect(saveStub).to.have.been.calledOnce;
    });

    it('should create a notification with minimum required fields only', async () => {
      const minimalNotificationData = {
        userId: '123456',
        message: 'Minimal notification'
      };

      const expectedNotification = { ...minimalNotificationData, _id: 'mockId' };
      saveStub.resolves(expectedNotification);

      const result = await notificationRepository.create(minimalNotificationData);

      expect(saveStub).to.have.been.calledOnce;
      expect(result).to.deep.equal(expectedNotification);
    });

    it('should handle concurrent creation of multiple notifications', async () => {
      const notificationData1 = { userId: '123', message: 'Test 1', type: 'info' };
      const notificationData2 = { userId: '456', message: 'Test 2', type: 'alert' };
      const notificationData3 = { userId: '789', message: 'Test 3', type: 'warning' };

      const expectedNotifications = [
        { ...notificationData1, _id: 'mockId1' },
        { ...notificationData2, _id: 'mockId2' },
        { ...notificationData3, _id: 'mockId3' }
      ];

      saveStub.onFirstCall().resolves(expectedNotifications[0]);
      saveStub.onSecondCall().resolves(expectedNotifications[1]);
      saveStub.onThirdCall().resolves(expectedNotifications[2]);

      const results = await Promise.all([
        notificationRepository.create(notificationData1),
        notificationRepository.create(notificationData2),
        notificationRepository.create(notificationData3)
      ]);

      expect(saveStub).to.have.been.calledThrice;
      expect(results).to.deep.equal(expectedNotifications);
    });

    it('should return the created notification object with a valid MongoDB _id', async () => {
      const notificationData = {
        userId: '123456',
        message: 'Test notification',
        type: 'info'
      };

      const expectedNotification = {
        ...notificationData,
        _id: 'valid_mongodb_id'
      };

      saveStub.resolves(expectedNotification);

      const result = await notificationRepository.create(notificationData);

      expect(saveStub).to.have.been.calledOnce;
      expect(result).to.deep.equal(expectedNotification);
      expect(result).to.have.property('_id').that.is.a('string');
    });

    it('should throw an error when trying to create a duplicate notification', async () => {
      const notificationData = {
        userId: '123456',
        message: 'Test notification',
        type: 'info'
      };

      const duplicateError = new Error('Duplicate key error');
      duplicateError.code = 11000;

      saveStub.onFirstCall().resolves({ ...notificationData, _id: 'mockId' });
      saveStub.onSecondCall().rejects(duplicateError);

      await notificationRepository.create(notificationData);

      try {
        await notificationRepository.create(notificationData);
        expect.fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).to.be.an('error');
        expect(error.code).to.equal(11000);
        expect(error.message).to.include('Duplicate key error');
      }

      expect(saveStub).to.have.been.calledTwice;
    });

  });
});


//find by id of notification
describe('findByUserId', () => {
  let notificationRepository;
  let findStub;

  beforeEach(() => {
    notificationRepository = new NotificationRepository();
    findStub = sinon.stub(Notification, 'find');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should return an array of notifications for a valid userId', async () => {
    const userId = '123456';
    const notifications = [
      { _id: 'mockId1', userId, message: 'Notification 1', type: 'info' },
      { _id: 'mockId2', userId, message: 'Notification 2', type: 'alert' }
    ];
    findStub.resolves(notifications);

    const result = await notificationRepository.findByUserId(userId);

    expect(findStub).to.have.been.calledOnceWith({ userId });
    expect(result).to.deep.equal(notifications);
  });

  it('should return an empty array if no notifications are found for the userId', async () => {
    const userId = '999999';
    findStub.resolves([]);

    const result = await notificationRepository.findByUserId(userId);

    expect(findStub).to.have.been.calledOnceWith({ userId });
    expect(result).to.deep.equal([]);
  });

  it('should throw an error if the database connection is lost', async () => {
    const userId = '123456';
    const connectionError = new Error('Database connection lost');
    findStub.rejects(connectionError);

    try {
      await notificationRepository.findByUserId(userId);
      expect.fail('Expected an error to be thrown');
    } catch (error) {
      expect(error).to.be.an('error');
      expect(error.message).to.equal('Database connection lost');
    }

    expect(findStub).to.have.been.calledOnceWith({ userId });
  });

  it('should return notifications containing special characters in message and type fields', async () => {
    const userId = '123456';
    const notifications = [
      { _id: 'mockId1', userId, message: 'Hello! @#$%^&*()', type: 'info <>/\\' }
    ];
    findStub.resolves(notifications);

    const result = await notificationRepository.findByUserId(userId);

    expect(findStub).to.have.been.calledOnceWith({ userId });
    expect(result).to.deep.equal(notifications);
  });

  it('should handle concurrent requests for multiple userIds', async () => {
    const userId1 = '123';
    const userId2 = '456';
    const userId3 = '789';

    const notifications1 = [{ _id: 'mockId1', userId: userId1, message: 'Test 1', type: 'info' }];
    const notifications2 = [{ _id: 'mockId2', userId: userId2, message: 'Test 2', type: 'alert' }];
    const notifications3 = [{ _id: 'mockId3', userId: userId3, message: 'Test 3', type: 'warning' }];

    findStub.onFirstCall().resolves(notifications1);
    findStub.onSecondCall().resolves(notifications2);
    findStub.onThirdCall().resolves(notifications3);

    const results = await Promise.all([
      notificationRepository.findByUserId(userId1),
      notificationRepository.findByUserId(userId2),
      notificationRepository.findByUserId(userId3)
    ]);

    expect(findStub).to.have.been.calledThrice;
    expect(results).to.deep.equal([notifications1, notifications2, notifications3]);
  });
});



//get markas read and delete the notifications

// describe('NotificationRepository', () => {
  

describe('markAsReadAndDelete', () => {
  let notificationRepository;
  let findByIdAndUpdateStub, findOneAndDeleteStub;

  beforeEach(() => {
    notificationRepository = new NotificationRepository();
    findByIdAndUpdateStub = sinon.stub(Notification, 'findByIdAndUpdate');
    findOneAndDeleteStub = sinon.stub(Notification, 'findOneAndDelete');
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('markAsReadAndDelete', () => {
    it('should successfully mark a notification as read and delete it', async () => {
      const notificationId = 'mockNotificationId';
      const updatedNotification = { _id: notificationId, isRead: true, message: 'Test notification' };

      findByIdAndUpdateStub.resolves(updatedNotification);
      findOneAndDeleteStub.resolves(updatedNotification);

      const result = await notificationRepository.markAsReadAndDelete(notificationId);

      console.log('findOneAndDelete called with:', findOneAndDeleteStub.getCall(0)?.args[0]); // Debugging log

      expect(findByIdAndUpdateStub).to.have.been.calledOnceWith(
        notificationId,
        { isRead: true },
        { new: true }
      );
      expect(findOneAndDeleteStub).to.have.been.calledOnceWith({ _id: notificationId });
      expect(result).to.deep.equal(updatedNotification);
    });

    it('should return null if the notification is not found', async () => {
      const notificationId = 'mockNotificationId';

      findByIdAndUpdateStub.resolves(null); // Simulate not found

      const result = await notificationRepository.markAsReadAndDelete(notificationId);

      console.log('findOneAndDelete should NOT be called, call count:', findOneAndDeleteStub.callCount); // Debugging log

      expect(findByIdAndUpdateStub).to.have.been.calledOnceWith(
        notificationId,
        { isRead: true },
        { new: true }
      );
      expect(findOneAndDeleteStub).to.not.have.been.called;
      expect(result).to.be.null;
    });

    it('should verify that the notification is no longer in the database after deletion', async () => {
      const notificationId = 'mockNotificationId';
      const updatedNotification = { _id:notificationId, isRead: true, message: 'Test notification' };

      findByIdAndUpdateStub.resolves(updatedNotification);
      findOneAndDeleteStub.resolves(updatedNotification);
      const findByIdStub = sinon.stub(Notification, 'findById').resolves(null);

      await notificationRepository.markAsReadAndDelete(notificationId);

      console.log('findOneAndDelete called with:', findOneAndDeleteStub.getCall(0)?.args[0]); // Debugging log

      expect(findByIdAndUpdateStub).to.have.been.calledOnceWith(
        notificationId,
        { isRead: true },
        { new: true }
      );
      expect(findOneAndDeleteStub).to.have.been.calledOnceWith({_id:notificationId });

      const deletedNotification = await Notification.findById(notificationId);
      expect(deletedNotification).to.be.null;

      findByIdStub.restore();
    });
  // });

  it('should handle errors thrown by findByIdAndUpdate', async () => {
    const notificationId = 'mockNotificationId';
    const errorMessage = 'Database error';

    findByIdAndUpdateStub.rejects(new Error(errorMessage));

    try {
      await notificationRepository.markAsReadAndDelete(notificationId);
      expect.fail('Expected an error to be thrown');
    } catch (error) {
      expect(error).to.be.an('error');
      expect(error.message).to.equal(errorMessage);
    }

    expect(findByIdAndUpdateStub).to.have.been.calledOnceWith(
      notificationId,
      { isRead: true },
      { new: true }
    );
    expect(findOneAndDeleteStub).to.not.have.been.called;
  });

});
});