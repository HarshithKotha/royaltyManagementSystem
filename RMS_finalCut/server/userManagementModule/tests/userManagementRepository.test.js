const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
// const chaiAsPromised = require('chai-as-promised');
const mongoose = require('mongoose');
const { expect } = chai;

chai.use(sinonChai);
// chai.use(chaiAsPromised);
before(async () => {
    const chaiAsPromised = await import('chai-as-promised');
    chai.use(chaiAsPromised.default);
  });

const UserRepository = require('../repositories/userRepository');
const User = require('../models/userModel');
const Artist = require('../models/artistModel');
const Manager = require('../models/managerModel');

describe('User Repository Tests', () => {
  let userRepository;
  let userStub;
  let artistStub;
  let managerStub;

  beforeEach(() => {
    userRepository = new UserRepository();
    
    // Stubs for User model
    userStub = sinon.stub(User.prototype, 'save');
    sinon.stub(User, 'findOne');
    sinon.stub(User, 'findByIdAndUpdate');
    sinon.stub(User, 'deleteOne');
    sinon.stub(User, 'find');

    // Stubs for Artist model
    artistStub = sinon.stub(Artist.prototype, 'save');
    sinon.stub(Artist, 'findOne');
    sinon.stub(Artist, 'findOneAndUpdate');
    sinon.stub(Artist, 'deleteOne');
    sinon.stub(Artist, 'find');

    // Stubs for Manager model
    managerStub = sinon.stub(Manager.prototype, 'save');
    sinon.stub(Manager, 'findOne');
    sinon.stub(Manager, 'findOneAndUpdate');
    sinon.stub(Manager, 'deleteOne');
    sinon.stub(Manager, 'find');
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('createUser', () => {
    it('should save a new user', async () => {
      const userData = {
        username: 'testuser',
        password: 'hashedpassword',
        email: 'test@example.com',
        role: 'Artist'
      };

      const expectedUser = {
        _id: new mongoose.Types.ObjectId(),
        ...userData
      };

      userStub.resolves(expectedUser);

      const result = await userRepository.createUser(userData);

      expect(userStub).to.have.been.calledOnce;
      expect(result).to.deep.equal(expectedUser);
    });
  });

  describe('createManager', () => {
    it('should save manager details', async () => {
      const managerData = {
        managerId: new mongoose.Types.ObjectId(),
        username: 'testmanager',
        fullName: 'Test Manager',
        email: 'manager@example.com'
      };

      const expectedManager = {
        _id: new mongoose.Types.ObjectId(),
        ...managerData
      };

      managerStub.resolves(expectedManager);

      const result = await userRepository.createManager(managerData);

      expect(managerStub).to.have.been.calledOnce;
      expect(result).to.deep.equal(expectedManager);
    });
  });

  describe('createArtist', () => {
    it('should save artist details', async () => {
      const artistData = {
        artistId: new mongoose.Types.ObjectId(),
        username: 'testartist',
        fullName: 'Test Artist',
        email: 'artist@example.com'
      };

      const expectedArtist = {
        _id: new mongoose.Types.ObjectId(),
        ...artistData
      };

      artistStub.resolves(expectedArtist);

      const result = await userRepository.createArtist(artistData);

      expect(artistStub).to.have.been.calledOnce;
      expect(result).to.deep.equal(expectedArtist);
    });
  });

  describe('findUserByUsername', () => {
    it('should find user by username', async () => {
      const username = 'testuser';
      const expectedUser = {
        _id: new mongoose.Types.ObjectId(),
        username,
        role: 'Artist'
      };

      User.findOne.withArgs({ username }).resolves(expectedUser);

      const result = await userRepository.findUserByUsername(username);

      expect(User.findOne).to.have.been.calledOnceWithExactly({ username });
      expect(result).to.deep.equal(expectedUser);
    });
  });

  describe('findUserProfileByRole', () => {
    it('should find artist profile by userId', async () => {
      const userId = new mongoose.Types.ObjectId();
      const expectedArtist = {
        _id: new mongoose.Types.ObjectId(),
        artistId: userId,
        fullName: 'Test Artist'
      };

      Artist.findOne.withArgs({ artistId: userId }).returns({
        populate: sinon.stub().returns({
          populate: sinon.stub().returns({
            lean: sinon.stub().resolves(expectedArtist)
          })
        })
      });

      const result = await userRepository.findUserProfileByRole(userId, 'Artist');

      expect(Artist.findOne).to.have.been.calledWith({ artistId: userId });
      expect(result).to.deep.equal(expectedArtist);
    });

    it('should find manager profile by userId', async () => {
      const userId = new mongoose.Types.ObjectId();
      const expectedManager = {
        _id: new mongoose.Types.ObjectId(),
        managerId: userId,
        fullName: 'Test Manager'
      };

      Manager.findOne.withArgs({ managerId: userId }).returns({
        populate: sinon.stub().returns({
          lean: sinon.stub().resolves(expectedManager)
        })
      });

      const result = await userRepository.findUserProfileByRole(userId, 'Manager');

      expect(Manager.findOne).to.have.been.calledWith({ managerId: userId });
      expect(result).to.deep.equal(expectedManager);
    });

    it('should return null for unsupported role', async () => {
      const userId = new mongoose.Types.ObjectId();
      const result = await userRepository.findUserProfileByRole(userId, 'Admin');
      expect(result).to.be.null;
    });
  });

  describe('updateUserProfile', () => {
    it('should update artist profile', async () => {
      const userId = new mongoose.Types.ObjectId();
      const updateData = { fullName: 'Updated Artist Name' };
      const expectedUpdatedArtist = {
        _id: new mongoose.Types.ObjectId(),
        artistId: userId,
        fullName: 'Updated Artist Name'
      };

      Artist.findOneAndUpdate.resolves(expectedUpdatedArtist);

      const result = await userRepository.updateUserProfile(userId, 'Artist', updateData);

      expect(Artist.findOneAndUpdate).to.have.been.calledWith(
        { artistId: userId },
        updateData,
        { new: true }
      );
      expect(result).to.deep.equal(expectedUpdatedArtist);
    });

    it('should update manager profile', async () => {
      const userId = new mongoose.Types.ObjectId();
      const updateData = { fullName: 'Updated Manager Name' };
      const expectedUpdatedManager = {
        _id: new mongoose.Types.ObjectId(),
        managerId: userId,
        fullName: 'Updated Manager Name'
      };

      Manager.findOneAndUpdate.resolves(expectedUpdatedManager);

      const result = await userRepository.updateUserProfile(userId, 'Manager', updateData);

      expect(Manager.findOneAndUpdate).to.have.been.calledWith(
        { managerId: userId },
        updateData,
        { new: true }
      );
      expect(result).to.deep.equal(expectedUpdatedManager);
    });

    it('should return null for unsupported role', async () => {
      const userId = new mongoose.Types.ObjectId();
      const updateData = { fullName: 'Updated Name' };
      const result = await userRepository.updateUserProfile(userId, 'Admin', updateData);
      expect(result).to.be.null;
    });
  });

  describe('deleteUser', () => {
    it('should delete artist and user', async () => {
      const userId = new mongoose.Types.ObjectId();

      Artist.deleteOne.resolves({ acknowledged: true, deletedCount: 1 });
      User.deleteOne.resolves({ acknowledged: true, deletedCount: 1 });

      await userRepository.deleteUser(userId, 'Artist');

      expect(Artist.deleteOne).to.have.been.calledWith({ artistId: userId });
      expect(User.deleteOne).to.have.been.calledWith({ _id: userId });
    });

    it('should delete manager and user', async () => {
      const userId = new mongoose.Types.ObjectId();

      Manager.deleteOne.resolves({ acknowledged: true, deletedCount: 1 });
      User.deleteOne.resolves({ acknowledged: true, deletedCount: 1 });

      await userRepository.deleteUser(userId, 'Manager');

      expect(Manager.deleteOne).to.have.been.calledWith({ managerId: userId });
      expect(User.deleteOne).to.have.been.calledWith({ _id: userId });
    });
  });

  describe('getAllUsersByRole', () => {
    it('should get all artists', async () => {
      const expectedArtists = [
        { _id: new mongoose.Types.ObjectId(), fullName: 'Artist 1' },
        { _id: new mongoose.Types.ObjectId(), fullName: 'Artist 2' }
      ];

      Artist.find.resolves(expectedArtists);

      const result = await userRepository.getAllUsersByRole('Artist');

      expect(Artist.find).to.have.been.calledOnce;
      expect(result).to.deep.equal(expectedArtists);
    });

    it('should get all managers', async () => {
      const expectedManagers = [
        { _id: new mongoose.Types.ObjectId(), fullName: 'Manager 1' },
        { _id: new mongoose.Types.ObjectId(), fullName: 'Manager 2' }
      ];

      Manager.find.resolves(expectedManagers);

      const result = await userRepository.getAllUsersByRole('Manager');

      expect(Manager.find).to.have.been.calledOnce;
      expect(result).to.deep.equal(expectedManagers);
    });

    it('should get all users', async () => {
      const expectedUsers = [
        { _id: new mongoose.Types.ObjectId(), username: 'user1' },
        { _id: new mongoose.Types.ObjectId(), username: 'user2' }
      ];

      User.find.resolves(expectedUsers);

      const result = await userRepository.getAllUsersByRole('User');

      expect(User.find).to.have.been.calledOnce;
      expect(result).to.deep.equal(expectedUsers);
    });

    it('should return null for unsupported role', async () => {
      const result = await userRepository.getAllUsersByRole('InvalidRole');
      expect(result).to.be.null;
    });
  });

  describe('updateUserStatusById', () => {
    it('should update user status', async () => {
      const userId = new mongoose.Types.ObjectId();
      const isActive = false;
      const expectedUpdatedUser = {
        _id: userId,
        username: 'testuser',
        isActive: false
      };

      User.findByIdAndUpdate.withArgs(
        userId,
        { isActive },
        { new: true }
      ).resolves(expectedUpdatedUser);

      const result = await userRepository.updateUserStatusById(userId, isActive);

      expect(User.findByIdAndUpdate).to.have.been.calledWith(
        userId,
        { isActive },
        { new: true }
      );
      expect(result).to.deep.equal(expectedUpdatedUser);
    });
  });
});