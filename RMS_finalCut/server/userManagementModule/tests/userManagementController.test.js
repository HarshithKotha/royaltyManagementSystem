const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
// const chaiAsPromised = require('chai-as-promised');
const { NotFoundError } = require('ca-webutils/expressx');
const UserService = require('../services/userService');
const userController = require('../controllers/userController');

chai.use(sinonChai);
// chai.use(chaiAsPromised);
before(async () => {
    const chaiAsPromised = await import('chai-as-promised');
    chai.use(chaiAsPromised.default);
  });

  describe('User Controller', () => {
    let userServiceStub;
    let res;
  
    beforeEach(() => {
      userServiceStub = sinon.stub(UserService.prototype);
      
      // Setup response object
      res = {
        status: sinon.stub().returnsThis(),
        send: sinon.stub().returnsThis(),
        json: sinon.stub().returnsThis()
      };
    });
  
    afterEach(() => {
      sinon.restore();
    });
  
    describe('createUser', () => {
      it('should successfully create a user', async () => {
        const userData = {
          username: 'testuser',
          password: 'password123',
          email: 'test@test.com',
          role: 'Artist'
        };
        const createdUser = { ...userData, _id: '123' };
        userServiceStub.createUser.resolves(createdUser);
  
        // Create request object with necessary properties
        const req = {
          body: userData,
          method: 'POST'
        };
  
        // Execute the wrapped controller function
        await userController.createUser(req, res);
  
        // The routeHandler should have called res.status and res.send
        expect(userServiceStub.createUser).to.have.been.calledWith(userData);
      });
  
      it('should handle validation error', async () => {
        const invalidData = { username: 'test' }; // Missing required fields
        userServiceStub.createUser.rejects(new Error('ValidationError'));
  
        const req = {
          body: invalidData,
          method: 'POST'
        };
  
        await userController.createUser(req, res);
        expect(userServiceStub.createUser).to.have.been.calledWith(invalidData);
      });
    });
  
    describe('getUserByUsername', () => {
      it('should successfully get user by username', async () => {
        const username = 'testuser';
        const user = {
          username,
          email: 'test@test.com',
          role: 'Artist'
        };
        userServiceStub.getUserProfileByUsername.resolves(user);
  
        const req = {
          params: { username },
          method: 'GET',
          path: '/users/' + username
        };
  
        await userController.getUserByUsername(req, res);
  
        expect(userServiceStub.getUserProfileByUsername).to.have.been.calledWith(username);
      });
  
      it('should handle non-existent user', async () => {
        const username = 'nonexistent';
        userServiceStub.getUserProfileByUsername.resolves(null);
  
        const req = {
          params: { username },
          method: 'GET',
          path: '/users/' + username,
          query: {}
        };
  
        await userController.getUserByUsername(req, res);
        expect(userServiceStub.getUserProfileByUsername).to.have.been.calledWith(username);
      });
    });
  
    describe('updateUser', () => {
      it('should successfully update user', async () => {
        const username = 'testuser';
        const updateData = { email: 'new@test.com' };
        const updatedUser = { username, ...updateData };
        userServiceStub.updateUserProfile.resolves(updatedUser);
  
        const req = {
          params: { username },
          body: updateData,
          method: 'PUT'
        };
  
        await userController.updateUser(req, res);
  
        expect(userServiceStub.updateUserProfile).to.have.been.calledWith(username, updateData);
      });
  
      it('should handle update of non-existent user', async () => {
        const username = 'nonexistent';
        userServiceStub.updateUserProfile.resolves(null);
  
        const req = {
          params: { username },
          body: { email: 'new@test.com' },
          method: 'PUT'
        };
  
        await userController.updateUser(req, res);
        expect(userServiceStub.updateUserProfile).to.have.been.calledWith(username, { email: 'new@test.com' });
      });
    });
  
    describe('deleteUser', () => {
      it('should successfully delete user', async () => {
        const username = 'testuser';
        userServiceStub.deleteUser.resolves(true);
  
        const req = {
          params: { username },
          method: 'DELETE'
        };
  
        await userController.deleteUser(req, res);
  
        expect(userServiceStub.deleteUser).to.have.been.calledWith(username);
      });
  
      it('should handle failed deletion', async () => {
        const username = 'nonexistent';
        userServiceStub.deleteUser.resolves(false);
  
        const req = {
          params: { username },
          method: 'DELETE'
        };
  
        await userController.deleteUser(req, res);
        expect(userServiceStub.deleteUser).to.have.been.calledWith(username);
      });
    });
  
    describe('getAllUsers', () => {
      it('should successfully get all users with role filter', async () => {
        const users = [
          { username: 'user1', role: 'Artist' },
          { username: 'user2', role: 'Artist' }
        ];
        userServiceStub.getAllUsers.resolves(users);
  
        const req = {
          params: { role: 'Artist' },
          method: 'GET',
          path: '/users'
        };
  
        await userController.getAllUsers(req, res);
  
        expect(userServiceStub.getAllUsers).to.have.been.calledWith('Artist');
      });
  
      it('should handle empty result', async () => {
        userServiceStub.getAllUsers.resolves([]);
  
        const req = {
          params: { role: 'Manager' },
          method: 'GET',
          path: '/users'
        };
  
        await userController.getAllUsers(req, res);
        expect(userServiceStub.getAllUsers).to.have.been.calledWith('Manager');
      });
    });
  
    describe('toggleUserStatus', () => {
      it('should successfully toggle user status', async () => {
        const userId = '123';
        const updatedUser = {
          _id: userId,
          username: 'testuser',
          isActive: true
        };
        userServiceStub.toggleUserStatus.resolves(updatedUser);
  
        const req = {
          params: { id: userId },
          body: { isActive: true },
          method: 'PATCH'
        };
  
        await userController.toggleUserStatus(req, res);
  
        expect(userServiceStub.toggleUserStatus).to.have.been.calledWith(userId, true);
      });
  
      it('should handle toggle status for non-existent user', async () => {
        const userId = 'nonexistent';
        userServiceStub.toggleUserStatus.rejects(new Error('User not found'));
  
        const req = {
          params: { id: userId },
          body: { isActive: true },
          method: 'PATCH'
        };
  
        await userController.toggleUserStatus(req, res);
        expect(userServiceStub.toggleUserStatus).to.have.been.calledWith(userId, true);
      });
    });
  });