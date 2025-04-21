const mongoose = require('mongoose');
const { expect } = require('chai');
const sinon = require('sinon');
const Manager = require('../../models/managerModel');
const User = require('../../models/userModel');
const Artist = require('../../models/artistModel');

describe('Manager Model Test Suite', () => {
  let testUser;
  let testArtist;
  let testArtistUser;

  before(async () => {
    await mongoose.connect('mongodb://localhost:27017/test_db');
  });

  after(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clean up collections
    await Manager.deleteMany({});
    await User.deleteMany({});
    await Artist.deleteMany({});

    // Create a test user
    const userData = {
      username: 'testuser',
      email: 'testuser@example.com',
      password: 'Password123!',
      role: 'Manager'
    };
    testUser = await User.create(userData);

    const artistUserData = {
      username: 'testartist',
      email: 'artist@example.com',
      password: 'Password123!',
      role: 'Artist'
    };
    testArtistUser = await User.create(artistUserData);

    // Create test artist
    testArtist = await Artist.create({
      artistId:testArtistUser._id,
      fullName: 'Test Artist',
      username: 'testartist',
      email: 'artist@example.com',
      role: 'Artist'
    });
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('Schema Validation', () => {
    it('should create a valid manager with all required fields', async () => {
      const validManager = {
        managerId: testUser._id,
        fullName: 'John Doe',
        username: 'johndoe',
        email: 'john@example.com',
        mobileNo: '1234567890',
        address: '123 Test St',
        description: 'Experienced manager',
        managedArtists: [testArtist._id]
      };

      const manager = await Manager.create(validManager);

      expect(manager).to.have.property('_id');
      expect(manager.managerId.toString()).to.equal(testUser._id.toString());
      expect(manager.fullName).to.equal('John Doe');
      expect(manager.username).to.equal('johndoe');
      expect(manager.email).to.equal('john@example.com');
      expect(manager.mobileNo).to.equal('1234567890');
      expect(manager.address).to.equal('123 Test St');
      expect(manager.description).to.equal('Experienced manager');
      expect(manager.commissionPercentage).to.equal(12);
      expect(manager.managerShare).to.equal(0);
      expect(manager.managedArtists[0].toString()).to.equal(testArtist._id.toString());
    });

    it('should fail when required fields are missing', async () => {
      const invalidManager = {
        fullName: 'John Doe'
      };

      try {
        await Manager.create(invalidManager);
        expect.fail('Should have thrown validation error');
      } catch (error) {
        expect(error).to.be.an('error');
        expect(error.name).to.equal('ValidationError');
        expect(error.errors).to.have.property('managerId');
        expect(error.errors).to.have.property('username');
        expect(error.errors).to.have.property('email');
        expect(error.errors.managerId.kind).to.equal('required');
        expect(error.errors.username.kind).to.equal('required');
        expect(error.errors.email.kind).to.equal('required');
      }
    });

    it('should enforce unique email constraint', async () => {
      const managerData = {
        managerId: testUser._id,
        fullName: 'John Doe',
        username: 'johndoe',
        email: 'unique@example.com',
        mobileNo: '1234567890'
      };

      await Manager.create(managerData);

      const duplicateManager = {
        ...managerData,
        username: 'different',
        fullName: 'Different Name'
      };

      try {
        await Manager.create(duplicateManager);
        expect.fail('Should have thrown duplicate key error');
      } catch (error) {
        expect(error).to.be.an('error');
        expect(error.code).to.equal(11000);
        expect(error.keyPattern).to.have.property('email');
      }
    });
  });

  describe('Default Values', () => {
    it('should set default values correctly', async () => {
      const now = new Date();
      const manager = await Manager.create({
        managerId: testUser._id,
        fullName: 'John Doe',
        username: 'johndoe',
        email: 'john@example.com'
      });

      expect(manager.managerShare).to.equal(0);
      expect(manager.commissionPercentage).to.equal(12);
      expect(manager.createdAt).to.be.an.instanceOf(Date);
      expect(manager.updatedAt).to.be.an.instanceOf(Date);
      expect(manager.managedArtists).to.be.an('array').that.is.empty;
      expect(manager.createdAt.getTime()).to.be.at.least(now.getTime());
    });
  });

  describe('Relationships', () => {
    it('should correctly populate managerId reference', async () => {
      const manager = await Manager.create({
        managerId: testUser._id,
        fullName: 'John Doe',
        username: 'johndoe',
        email: 'john@example.com'
      });

      const populatedManager = await Manager.findById(manager._id)
        .populate('managerId')
        .lean();

      expect(populatedManager.managerId._id.toString()).to.equal(testUser._id.toString());
      expect(populatedManager.managerId.username).to.equal(testUser.username);
      expect(populatedManager.managerId.email).to.equal(testUser.email);
      expect(populatedManager.managerId.role).to.equal('Manager');
    });

    it('should handle multiple managed artists', async () => {
      const artist2 = await Artist.create({
        artistId:testArtistUser._id,
        fullName: 'Test Artist 2',
        username: 'testartist2',
        email: 'artist2@example.com',
        role: 'Artist'
      });

      const manager = await Manager.create({
        managerId: testUser._id,
        fullName: 'John Doe',
        username: 'johndoe',
        email: 'john@example.com',
        managedArtists: [testArtist._id, artist2._id]
      });

      const populatedManager = await Manager.findById(manager._id)
        .populate('managedArtists')
        .lean();

      expect(populatedManager.managedArtists).to.have.lengthOf(2);
      expect(populatedManager.managedArtists[0].username).to.equal('testartist');
      expect(populatedManager.managedArtists[1].username).to.equal('testartist2');
      expect(populatedManager.managedArtists[0].email).to.equal('artist@example.com');
      expect(populatedManager.managedArtists[1].email).to.equal('artist2@example.com');
    });

    it('should handle removing artists from managedArtists array', async () => {
      const manager = await Manager.create({
        managerId: testUser._id,
        fullName: 'John Doe',
        username: 'johndoe',
        email: 'john@example.com',
        managedArtists: [testArtist._id]
      });

      const updatedManager = await Manager.findByIdAndUpdate(
        manager._id,
        { $pull: { managedArtists: testArtist._id } },
        { new: true }
      );

      expect(updatedManager.managedArtists).to.have.lengthOf(0);
    });
  });

  describe('Updates and Modifications', () => {
    it('should update manager details correctly', async () => {
      const manager = await Manager.create({
        managerId: testUser._id,
        fullName: 'John Doe',
        username: 'johndoe',
        email: 'john@example.com'
      });

      const updateTime = new Date();
      const updatedManager = await Manager.findByIdAndUpdate(
        manager._id,
        {
          fullName: 'John Updated',
          mobileNo: '9876543210',
          commissionPercentage: 15
        },
        { new: true }
      );

      expect(updatedManager.fullName).to.equal('John Updated');
      expect(updatedManager.mobileNo).to.equal('9876543210');
      expect(updatedManager.commissionPercentage).to.equal(15);
    });

    
  });

  describe('Edge Cases', () => {
    it('should handle empty managedArtists array updates', async () => {
      const manager = await Manager.create({
        managerId: testUser._id,
        fullName: 'John Doe',
        username: 'johndoe',
        email: 'john@example.com',
        managedArtists: [testArtist._id]
      });

      const updatedManager = await Manager.findByIdAndUpdate(
        manager._id,
        { managedArtists: [] },
        { new: true }
      );

      expect(updatedManager.managedArtists).to.be.an('array').that.is.empty;
    });

    it('should handle invalid ObjectId for managerId', async () => {
      try {
        await Manager.create({
          managerId: 'invalid-id',
          fullName: 'John Doe',
          username: 'johndoe',
          email: 'john@example.com'
        });
        expect.fail('Should have thrown cast error');
      } catch (error) {
        expect(error).to.be.an('error');
      }
    });
  });
});