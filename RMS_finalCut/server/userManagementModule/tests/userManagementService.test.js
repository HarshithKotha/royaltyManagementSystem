const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
// const chaiAsPromised = require('chai-as-promised');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { expect } = chai;

chai.use(sinonChai);
// chai.use(chaiAsPromised);
before(async () => {
    const chaiAsPromised = await import('chai-as-promised');
    chai.use(chaiAsPromised.default);
  });

const UserService = require('../services/userService');
const UserRepository = require('../repositories/userRepository');

describe('User Service Tests', () => {
  let userService;
  let userRepositoryStub;
  let bcryptStub;

  beforeEach(() => {
    userRepositoryStub = sinon.createStubInstance(UserRepository);
    bcryptStub = sinon.stub(bcrypt, 'hash');
    
    // Inject the stubbed repository into the service
    userService = new UserService();
    userService.userRepository = userRepositoryStub;
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('createUser', () => {
    it('should create user and artist profile for Artist role', async () => {
        const userData = {
          username: 'testartist',
          password: 'password123',
          email: 'artist@example.com',
          fullName: 'Test Artist',
          role: 'Artist'
        };
      
        const hashedPassword = 'hashedpassword123';
        const userId = new mongoose.Types.ObjectId();
        
        const createdUser = {
          _id: userId,
          username: userData.username,
          email: userData.email,
          role: userData.role
        };
      
        bcryptStub.resolves(hashedPassword);
        userRepositoryStub.createUser.resolves(createdUser);
        userRepositoryStub.createArtist.resolves({
          _id: new mongoose.Types.ObjectId(),
          artistId: userId,
          username: userData.username,
          email: userData.email,
          fullName: userData.fullName
        });
      
        const result = await userService.createUser(userData);
      
        expect(bcryptStub).to.have.been.calledWith(userData.password, 10);
        expect(userRepositoryStub.createUser).to.have.been.calledWith({
          ...userData,
          password: hashedPassword
        });
        expect(userRepositoryStub.createArtist).to.have.been.calledWith({
          artistId: userId,
          username: userData.username,
          email: userData.email,
          fullName: userData.fullName,
          role: userData.role  // Added role field to match actual implementation
        });
        expect(result).to.deep.equal(createdUser);
      });

    it('should create user and manager profile for Manager role', async () => {
      const userData = {
        username: 'testmanager',
        password: 'password123',
        email: 'manager@example.com',
        fullName: 'Test Manager',
        role: 'Manager'
      };

      const hashedPassword = 'hashedpassword123';
      const userId = new mongoose.Types.ObjectId();
      
      const createdUser = {
        _id: userId,
        username: userData.username,
        email: userData.email,
        role: userData.role
      };

      bcryptStub.resolves(hashedPassword);
      userRepositoryStub.createUser.resolves(createdUser);
      userRepositoryStub.createManager.resolves({
        _id: new mongoose.Types.ObjectId(),
        managerId: userId,
        username: userData.username,
        email: userData.email,
        fullName: userData.fullName,
        
      });

      const result = await userService.createUser(userData);

      expect(bcryptStub).to.have.been.calledWith(userData.password, 10);
      expect(userRepositoryStub.createUser).to.have.been.calledWith({
        ...userData,
        password: hashedPassword
      });
      expect(userRepositoryStub.createManager).to.have.been.calledWith({
        managerId: userId,
        username: userData.username,
        email: userData.email,
        fullName: userData.fullName,
        role:userData.role
      });
      expect(result).to.deep.equal(createdUser);
    });

    it('should only create user for Admin role', async () => {
      const userData = {
        username: 'testadmin',
        password: 'password123',
        email: 'admin@example.com',
        fullName: 'Test Admin',
        role: 'Admin'
      };

      const hashedPassword = 'hashedpassword123';
      const userId = new mongoose.Types.ObjectId();
      
      const createdUser = {
        _id: userId,
        username: userData.username,
        email: userData.email,
        role: userData.role
      };

      bcryptStub.resolves(hashedPassword);
      userRepositoryStub.createUser.resolves(createdUser);

      const result = await userService.createUser(userData);

      expect(bcryptStub).to.have.been.calledWith(userData.password, 10);
      expect(userRepositoryStub.createUser).to.have.been.calledWith({
        ...userData,
        password: hashedPassword
      });
      expect(userRepositoryStub.createArtist).to.not.have.been.called;
      expect(userRepositoryStub.createManager).to.not.have.been.called;
      expect(result).to.deep.equal(createdUser);
    });
  });

  describe('getUserProfileByUsername', () => {
    it('should get user profile by username', async () => {
      const username = 'testuser';
      const userId = new mongoose.Types.ObjectId();
      const user = {
        _id: userId,
        username,
        role: 'Artist'
      };
      const userProfile = {
        _id: new mongoose.Types.ObjectId(),
        artistId: userId,
        username,
        fullName: 'Test Artist'
      };

      userRepositoryStub.findUserByUsername.withArgs(username).resolves(user);
      userRepositoryStub.findUserProfileByRole.withArgs(userId, 'Artist').resolves(userProfile);

      const result = await userService.getUserProfileByUsername(username);

      expect(userRepositoryStub.findUserByUsername).to.have.been.calledWith(username);
      expect(userRepositoryStub.findUserProfileByRole).to.have.been.calledWith(userId, 'Artist');
      expect(result).to.deep.equal(userProfile);
    });

    it('should throw error if user not found', async () => {
      const username = 'nonexistentuser';
      userRepositoryStub.findUserByUsername.withArgs(username).resolves(null);

      await expect(userService.getUserProfileByUsername(username))
        .to.be.rejectedWith('User not found');
    });

    it('should throw error if profile not found', async () => {
      const username = 'testuser';
      const userId = new mongoose.Types.ObjectId();
      const user = {
        _id: userId,
        username,
        role: 'Artist'
      };

      userRepositoryStub.findUserByUsername.withArgs(username).resolves(user);
      userRepositoryStub.findUserProfileByRole.withArgs(userId, 'Artist').resolves(null);

      await expect(userService.getUserProfileByUsername(username))
        .to.be.rejectedWith('Artist details not found');
    });
  });

  describe('updateUserProfile', () => {
    it('should update user profile', async () => {
      const username = 'testuser';
      const userId = new mongoose.Types.ObjectId();
      const updateData = { fullName: 'Updated Name' };
      const user = {
        _id: userId,
        username,
        role: 'Artist'
      };
      const updatedProfile = {
        _id: new mongoose.Types.ObjectId(),
        artistId: userId,
        username,
        fullName: 'Updated Name'
      };

      userRepositoryStub.findUserByUsername.withArgs(username).resolves(user);
      userRepositoryStub.updateUserProfile.withArgs(userId, 'Artist', updateData).resolves(updatedProfile);

      const result = await userService.updateUserProfile(username, updateData);

      expect(userRepositoryStub.findUserByUsername).to.have.been.calledWith(username);
      expect(userRepositoryStub.updateUserProfile).to.have.been.calledWith(userId, 'Artist', updateData);
      expect(result).to.deep.equal(updatedProfile);
    });

    it('should throw error if user not found', async () => {
      const username = 'nonexistentuser';
      const updateData = { fullName: 'Updated Name' };

      userRepositoryStub.findUserByUsername.withArgs(username).resolves(null);

      await expect(userService.updateUserProfile(username, updateData))
        .to.be.rejectedWith('User not found');
    });

    it('should throw error if profile update fails', async () => {
      const username = 'testuser';
      const userId = new mongoose.Types.ObjectId();
      const updateData = { fullName: 'Updated Name' };
      const user = {
        _id: userId,
        username,
        role: 'Artist'
      };

      userRepositoryStub.findUserByUsername.withArgs(username).resolves(user);
      userRepositoryStub.updateUserProfile.withArgs(userId, 'Artist', updateData).resolves(null);

      await expect(userService.updateUserProfile(username, updateData))
        .to.be.rejectedWith('Artist details not found');
    });
  });

  describe('deleteUser', () => {
    it('should delete user', async () => {
      const username = 'testuser';
      const userId = new mongoose.Types.ObjectId();
      const user = {
        _id: userId,
        username,
        role: 'Artist'
      };

      userRepositoryStub.findUserByUsername.withArgs(username).resolves(user);
      userRepositoryStub.deleteUser.withArgs(userId, 'Artist').resolves();

      const result = await userService.deleteUser(username);

      expect(userRepositoryStub.findUserByUsername).to.have.been.calledWith(username);
      expect(userRepositoryStub.deleteUser).to.have.been.calledWith(userId, 'Artist');
      expect(result).to.be.true;
    });

    it('should throw error if user not found', async () => {
      const username = 'nonexistentuser';

      userRepositoryStub.findUserByUsername.withArgs(username).resolves(null);

      await expect(userService.deleteUser(username))
        .to.be.rejectedWith('User not found');
    });
  });

  describe('getAllUsers', () => {
    it('should get all users by role', async () => {
      const role = 'Artist';
      const expectedUsers = [
        { _id: new mongoose.Types.ObjectId(), username: 'artist1' },
        { _id: new mongoose.Types.ObjectId(), username: 'artist2' }
      ];

      userRepositoryStub.getAllUsersByRole.withArgs(role).resolves(expectedUsers);

      const result = await userService.getAllUsers(role);

      expect(userRepositoryStub.getAllUsersByRole).to.have.been.calledWith(role);
      expect(result).to.deep.equal(expectedUsers);
    });
  });

  describe('toggleUserStatus', () => {
    it('should toggle user status', async () => {
      const userId = new mongoose.Types.ObjectId();
      const isActive = false;
      const updatedUser = {
        _id: userId,
        username: 'testuser',
        isActive: false
      };

      userRepositoryStub.updateUserStatusById.withArgs(userId, isActive).resolves(updatedUser);

      const result = await userService.toggleUserStatus(userId, isActive);

      expect(userRepositoryStub.updateUserStatusById).to.have.been.calledWith(userId, isActive);
      expect(result).to.deep.equal(updatedUser);
    });

    it('should throw error if user not found', async () => {
      const userId = new mongoose.Types.ObjectId();
      const isActive = false;

      userRepositoryStub.updateUserStatusById.withArgs(userId, isActive).resolves(null);

      await expect(userService.toggleUserStatus(userId, isActive))
        .to.be.rejectedWith('User not found');
    });
  });
});