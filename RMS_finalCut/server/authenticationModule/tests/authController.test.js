const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const { expect } = chai;

const User = require('../models/userModel');
const { login, verify, forgotPassword, resetPassword } = require('../controllers/authcontroller');

chai.use(sinonChai);

before(async () => {
    const chaiAsPromised = await import('chai-as-promised');
    chai.use(chaiAsPromised.default);
});

describe('Authentication Controller', () => {
    let req, res, userStub, jwtStub, bcryptStub, mockTransporter;

    beforeEach(() => {
        req = { body: {}, params: {}, user: {} };
        res = { status: sinon.stub().returnsThis(), json: sinon.stub() };

        userStub = sinon.stub(User, 'findOne');
        sinon.stub(User.prototype, 'save');

        jwtStub = sinon.stub(jwt, 'sign').returns('mock-token');
        sinon.stub(jwt, 'verify').returns({ id: 'mock-id' });

        bcryptStub = sinon.stub(bcrypt, 'compare');
        sinon.stub(bcrypt, 'hash').resolves('hashed-password');

        mockTransporter = { sendMail: sinon.stub().callsFake((mailOptions, callback) => callback(null, 'sent')) };
        sinon.stub(nodemailer, 'createTransport').returns(mockTransporter);
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('login', () => {
        it('should successfully login a user', async () => {
            const mockUser = { _id: 'user-id', email: 'test@example.com', password: 'hashed-password', username: 'testuser', role: 'user', isActive: true, isFirstLogin: false };
            req.body = { email: 'test@example.com', password: 'password123' };

            userStub.resolves(mockUser);
            bcryptStub.resolves(true);

            await login(req, res);

            expect(res.status).to.have.been.calledWith(200);
            expect(res.json).to.have.been.calledWith({ success: true, token: 'mock-token', user: { _id: mockUser._id, username: mockUser.username, email: mockUser.email, role: mockUser.role, isActive: mockUser.isActive, isFirstLogin: mockUser.isFirstLogin } });
        });

        it('should return 404 if user is not found', async () => {
            req.body = { email: 'nonexistent@example.com', password: 'password123' };
            userStub.resolves(null);

            await login(req, res);

            expect(res.status).to.have.been.calledWith(404);
            expect(res.json).to.have.been.calledWith({ success: false, error: 'User not found' });
        });

        it('should return 403 if user is inactive', async () => {
            const mockUser = { email: 'inactive@example.com', isActive: false };
            req.body = { email: 'inactive@example.com', password: 'password123' };

            userStub.resolves(mockUser);
            await login(req, res);

            expect(res.status).to.have.been.calledWith(403);
            expect(res.json).to.have.been.calledWith({ success: false, error: 'User is not active' });
        });
    });

    describe('verify', () => {
        it('should verify user successfully', () => {
            req.user = { _id: 'user-id', username: 'testuser' };
            verify(req, res);

            expect(res.status).to.have.been.calledWith(200);
            expect(res.json).to.have.been.calledWith({ success: true, user: req.user });
        });
    });

    describe('forgotPassword', () => {
        it('should send reset password email successfully', async () => {
            const mockUser = { _id: 'user-id', email: 'test@example.com' };
            req.body = { email: 'test@example.com' };

            userStub.resolves(mockUser);
            await forgotPassword(req, res);

            expect(mockTransporter.sendMail).to.have.been.called;
            expect(res.json).to.have.been.calledWith({ success: true, message: 'Password reset email sent successfully' });
        });
    });

    describe('resetPassword', () => {
        let updateStub;

        beforeEach(() => {
            updateStub = sinon.stub(User, 'findByIdAndUpdate');
        });

        afterEach(() => {
            updateStub.restore();
        });

        it('should reset password successfully', async () => {
            req.params = { id: 'user-id', token: 'valid-token' };
            req.body = { password: 'newpassword123' };

            updateStub.resolves({});
            await resetPassword(req, res);

            expect(res.json).to.have.been.calledWith({ success: true, message: 'Password reset successful' });
        });
    });
});