const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
// const chaiAsPromised = require('chai-as-promised');
const jwt = require('jsonwebtoken');
const { verifyUser } = require('../middleware/authMiddleware');
const User = require('../models/userModel');
const mongoose = require('mongoose');

// Setup chai plugins
chai.use(sinonChai);
// chai.use(chaiAsPromised);
before(async () => {
    const chaiAsPromised = await import('chai-as-promised');
    chai.use(chaiAsPromised.default);
  });
const expect = chai.expect;

describe('Authentication Middleware Tests', () => {
    let req, res, next, userStub, jwtStub;
    
    beforeEach(() => {
        // Reset all stubs/spies before each test
        req = {
            headers: {},
        };
        res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub()
        };
        next = sinon.spy();
        
        // Restore all stubs
        if (userStub) userStub.restore();
        if (jwtStub) jwtStub.restore();
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('Token Validation', () => {
        it('should return 401 if no authorization header is present', async () => {
            await verifyUser(req, res, next);
            
            expect(res.status).to.have.been.calledWith(401);
            expect(res.json).to.have.been.calledWith({
                success: false,
                error: "No authorization header provided"
            });
            expect(next).to.not.have.been.called;
        });

        it('should return 401 if token is not provided', async () => {
            req.headers.authorization = 'Bearer ';
            
            await verifyUser(req, res, next);
            
            expect(res.status).to.have.been.calledWith(401);
            expect(res.json).to.have.been.calledWith({
                success: false,
                error: "Token not provided"
            });
            expect(next).to.not.have.been.called;
        });

        it('should return 500 if token verification fails', async () => {
            req.headers.authorization = 'Bearer invalid.token.here';
            jwtStub = sinon.stub(jwt, 'verify').throws(new Error('Invalid token'));
            
            await verifyUser(req, res, next);
            
            expect(res.status).to.have.been.calledWith(500);
            expect(res.json).to.have.been.calledWith({
                success: false,
                error: "Authentication failed"
            });
            expect(next).to.not.have.been.called;
        });
    });

    describe('User Validation', () => {
        const validUserId = new mongoose.Types.ObjectId();
        const mockUser = {
            _id: validUserId,
            username: 'testuser',
            email: 'test@example.com',
            role: 'Artist'
        };

        it('should return 404 if user is not found', async () => {
            req.headers.authorization = 'Bearer valid.token.here';
            jwtStub = sinon.stub(jwt, 'verify').returns({ _id: validUserId });
            userStub = sinon.stub(User, 'findById').resolves(null);
            
            await verifyUser(req, res, next);
            
            expect(res.status).to.have.been.calledWith(404);
            expect(res.json).to.have.been.calledWith({
                success: false,
                error: "User not found"
            });
            expect(next).to.not.have.been.called;
        });

        it('should successfully authenticate valid user and token', async () => {
            req.headers.authorization = 'Bearer valid.token.here';
            jwtStub = sinon.stub(jwt, 'verify').returns({ _id: validUserId });
            userStub = sinon.stub(User, 'findById').resolves(mockUser);
            
            await verifyUser(req, res, next);
            
            expect(req.user).to.deep.equal(mockUser);
            expect(next).to.have.been.calledOnce;
            expect(res.status).to.not.have.been.called;
            expect(res.json).to.not.have.been.called;
        });

        it('should handle database errors gracefully', async () => {
            req.headers.authorization = 'Bearer valid.token.here';
            jwtStub = sinon.stub(jwt, 'verify').returns({ _id: validUserId });
            userStub = sinon.stub(User, 'findById').rejects(new Error('Database error'));
            
            await verifyUser(req, res, next);
            
            expect(res.status).to.have.been.calledWith(500);
            expect(res.json).to.have.been.calledWith({
                success: false,
                error: "Authentication failed"
            });
            expect(next).to.not.have.been.called;
        });
    });
});