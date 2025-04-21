const { expect } = require('chai');
const mongoose = require('mongoose');
const User = require('../models/userModel');

describe('User Model Tests', () => {
  // Connect to test database before all tests
  before(async function() {
    this.timeout(10000); // Give more time for initial connection
    // Use a test database URL - adjust based on your environment
    const mongoUri = process.env.MONGO_TEST_URI || 'mongodb://localhost:27017/test_database';
    await mongoose.connect(mongoUri);
  });

  // Disconnect after all tests
  after(async function() {
    await mongoose.disconnect();
  });

  // Clear users before each test
  beforeEach(async function() {
    this.timeout(10000); // Increase timeout for cleanup
    await User.deleteMany({});
  });

  it('should create a valid user', async function() {
    this.timeout(10000); // Increase timeout for this test
    const userData = {
      username: 'testuser',
      password: 'password123',
      email: 'test@example.com',
      role: 'Artist'
    };

    const user = new User(userData);
    const savedUser = await user.save();

    expect(savedUser).to.have.property('_id');
    expect(savedUser.username).to.equal(userData.username);
    expect(savedUser.email).to.equal(userData.email);
    expect(savedUser.role).to.equal(userData.role);
    expect(savedUser.isFirstLogin).to.equal(true);
    expect(savedUser.isActive).to.equal(true);
  });

  it('should require username, password, email and role', async function() {
    const user = new User({});
    let error;
    
    try {
      await user.save();
    } catch (err) {
      error = err;
    }

    expect(error).to.exist;
    expect(error.errors.username).to.exist;
    expect(error.errors.password).to.exist;
    expect(error.errors.email).to.exist;
    expect(error.errors.role).to.exist;
  });

  it('should validate role enum values', async function() {
    const userData = {
      username: 'testuser',
      password: 'password123',
      email: 'test@example.com',
      role: 'InvalidRole'
    };

    const user = new User(userData);
    let error;
    
    try {
      await user.save();
    } catch (err) {
      error = err;
    }

    expect(error).to.exist;
    expect(error.errors.role).to.exist;
  });

  it('should enforce unique username', async function() {
    const userData1 = {
      username: 'testuser',
      password: 'password123',
      email: 'test1@example.com',
      role: 'Artist'
    };

    const userData2 = {
      username: 'testuser',
      password: 'password456',
      email: 'test2@example.com',
      role: 'Manager'
    };

    await new User(userData1).save();
    
    let error;
    try {
      await new User(userData2).save();
    } catch (err) {
      error = err;
    }

    expect(error).to.exist;
    expect(error.code).to.equal(11000); // MongoDB duplicate key error code
  });
});