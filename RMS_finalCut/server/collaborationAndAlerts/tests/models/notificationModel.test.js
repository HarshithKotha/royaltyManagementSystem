const mongoose = require('mongoose');
const { expect } = require('chai');
const Notification = require('../../models/notificationModel'); // Adjust path as needed

describe('Notification Model Tests', function() {
  // Connect to test database before running tests
  before(async function() {
    await mongoose.connect('mongodb://localhost:27017/notification_test_db', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  });

  // Clear database between tests
  beforeEach(async function() {
    await mongoose.connection.dropDatabase();
  });

  // Disconnect after tests
  after(async function() {
    await mongoose.connection.close();
  });

  it('should create a valid notification with required fields', async function() {
    const userId = new mongoose.Types.ObjectId();
    const notificationData = {
      userId: userId,
      message: 'You received a new royalty payment',
      type: 'royaltyPayment'
    };
    
    const notification = new Notification(notificationData);
    const savedNotification = await notification.save();
    
    expect(savedNotification).to.have.property('_id');
    expect(savedNotification.userId.toString()).to.equal(userId.toString());
    expect(savedNotification.message).to.equal('You received a new royalty payment');
    expect(savedNotification.type).to.equal('royaltyPayment');
    expect(savedNotification.isRead).to.equal(false); // Default value
    expect(savedNotification.createdAt).to.be.instanceOf(Date);
  });

  it('should validate required fields', async function() {
    const notification = new Notification({});
    
    try {
      await notification.validate();
      throw new Error('Validation should have failed');
    } catch (error) {
      expect(error.errors.userId).to.exist;
      expect(error.errors.message).to.exist;
      expect(error.errors.type).to.exist;
    }
  });

  it('should validate notification type enum', async function() {
    const userId = new mongoose.Types.ObjectId();
    const notification = new Notification({
      userId: userId,
      message: 'Test message',
      type: 'invalidType' // Not in enum
    });
    
    try {
      await notification.validate();
      throw new Error('Validation should have failed');
    } catch (error) {
      expect(error.errors.type).to.exist;
    }
  });

  it('should accept all valid notification types', async function() {
    const userId = new mongoose.Types.ObjectId();
    const validTypes = ['royaltyPayment', 'collaborationRequest', 'profileUpdate', 'songUpdate'];
    
    for (const type of validTypes) {
      const notification = new Notification({
        userId: userId,
        message: `Test message for ${type}`,
        type: type
      });
      
      const savedNotification = await notification.save();
      expect(savedNotification.type).to.equal(type);
    }
  });

  it('should set default values correctly', async function() {
    const userId = new mongoose.Types.ObjectId();
    const notification = new Notification({
      userId: userId,
      message: 'Test message',
      type: 'profileUpdate'
    });
    
    const savedNotification = await notification.save();
    expect(savedNotification.isRead).to.equal(false);
    expect(savedNotification.createdAt).to.be.instanceOf(Date);
  });

  it('should transform toJSON correctly', function() {
    const userId = new mongoose.Types.ObjectId();
    const notification = new Notification({
      userId: userId,
      message: 'Test message',
      type: 'profileUpdate',
      __v: 0
    });
    
    const jsonObject = notification.toJSON();
    expect(jsonObject).to.not.have.property('__v');
  });

  it('should store and retrieve timestamps', async function() {
    const userId = new mongoose.Types.ObjectId();
    const notification = new Notification({
      userId: userId,
      message: 'Test message',
      type: 'songUpdate'
    });
    
    const savedNotification = await notification.save();
    expect(savedNotification).to.have.property('createdAt');
    expect(savedNotification).to.have.property('updatedAt');
    expect(savedNotification.createdAt).to.be.instanceOf(Date);
    expect(savedNotification.updatedAt).to.be.instanceOf(Date);
  });

  it('should update isRead field', async function() {
    const userId = new mongoose.Types.ObjectId();
    const notification = new Notification({
      userId: userId,
      message: 'Test message',
      type: 'collaborationRequest'
    });
    
    const savedNotification = await notification.save();
    expect(savedNotification.isRead).to.equal(false);
    
    savedNotification.isRead = true;
    const updatedNotification = await savedNotification.save();
    expect(updatedNotification.isRead).to.equal(true);
  });
});