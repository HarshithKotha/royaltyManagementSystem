const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const { expect } = chai;
const { Response } = require('ca-webutils/expressx');
const CollaborationService = require('../services/collaborationService');
const collaborationController = require('../controllers/collaborationController');

// Configure chai
chai.use(sinonChai);
before(async () => {
    const chaiAsPromised = await import('chai-as-promised');
    chai.use(chaiAsPromised.default);
});

describe('Collaboration Controller', () => {
    let sandbox;
    let mockResponse;
    let mockCollaboration;
    let mockCollaborations;

    beforeEach(() => {
        // Create a fresh sandbox
        sandbox = sinon.createSandbox();

        // Mock Express response object
        mockResponse = {
            status: sandbox.stub().returnsThis(),
            json: sandbox.stub().returnsThis(),
            send: sandbox.stub().returnsThis(),
            set: sandbox.stub().returnsThis()
        };

        // Setup mock data
        mockCollaboration = {
            collaborationId: 'collab-123',
            managerId: '507f1f77bcf86cd799439011',
            artistId: '507f1f77bcf86cd799439012',
            status: 'Pending',
            collaborationDate: new Date(),
            songsManaged: [],
            cancellationReason: null,
            managerDecision: null
        };

        mockCollaborations = [mockCollaboration];

        // Mock CollaborationService
        sandbox.stub(CollaborationService.prototype);
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('createCollaboration', () => {
        it('should create a new collaboration successfully', async () => {
            // Setup
            const req = {
                method: 'POST',
                body: {
                    managerId: '507f1f77bcf86cd799439011',
                    artistId: '507f1f77bcf86cd799439012'
                }
            };

            CollaborationService.prototype.createCollaboration
                .resolves(mockCollaboration);

            // Execute controller with expressx wrapper
            const handler = collaborationController.createCollaboration;
            await handler(req, mockResponse);

            // Assert
            expect(CollaborationService.prototype.createCollaboration)
                .to.have.been.calledWith(req.body);
            expect(mockResponse.send).to.have.been.calledWith({
                success: true,
                collaboration: mockCollaboration
            });
        });

        it('should handle service errors properly', async () => {
            // Setup
            const req = {
                method: 'POST',
                body: {
                    managerId: '507f1f77bcf86cd799439011',
                    artistId: '507f1f77bcf86cd799439012'
                }
            };

            const error = new Error('Service Error');
            CollaborationService.prototype.createCollaboration.rejects(error);

            // Execute controller with expressx wrapper
            const handler = collaborationController.createCollaboration;
            await handler(req, mockResponse);

            // Assert response contains error
            expect(mockResponse.status).to.have.been.calledWith(500);
            expect(mockResponse.send).to.have.been.calledWith({
                message: 'Service Error',
                status: 500,
                errors: error
            });
        });
    });

    describe('getCollaborationsByUserAndRole', () => {
        it('should fetch collaborations successfully', async () => {
            // Setup
            const req = {
                method: 'GET',
                params: {
                    userId: '507f1f77bcf86cd799439011',
                    role: 'manager'
                }
            };

            CollaborationService.prototype.getCollaborationsByUserAndRole
                .resolves(mockCollaborations);

            // Execute
            const handler = collaborationController.getCollaborationsByUserAndRole;
            await handler(req, mockResponse);

            // Assert
            expect(CollaborationService.prototype.getCollaborationsByUserAndRole)
                .to.have.been.calledWith(req.params.userId, req.params.role);
            expect(mockResponse.send).to.have.been.calledWith({
                success: true,
                collaborations: mockCollaborations
            });
        });
    });

    describe('updateCollaborationStatus', () => {
        it('should update status successfully', async () => {
            // Setup
            const updatedCollaboration = { ...mockCollaboration, status: 'Approved' };
            const req = {
                method: 'PUT',
                params: { collaborationId: 'collab-123' },
                body: { status: 'Approved' }
            };

            CollaborationService.prototype.updateCollaborationStatus
                .resolves(updatedCollaboration);

            // Execute
            const handler = collaborationController.updateCollaborationStatus;
            await handler(req, mockResponse);

            // Assert
            expect(mockResponse.send).to.have.been.calledWith({
                success: true,
                collaboration: updatedCollaboration
            });
        });

     

        it('should handle internal service errors properly', async () => {
            // Setup
            const req = {
                method: 'PUT',
                params: { collaborationId: 'collab-123' },
                body: { status: 'Approved' }
            };

            const error = new Error('Internal Service Error');
            CollaborationService.prototype.updateCollaborationStatus.rejects(error);

            // Execute controller with expressx wrapper
            const handler = collaborationController.updateCollaborationStatus;
            await handler(req, mockResponse);

            // Assert response contains error
            expect(mockResponse.status).to.have.been.calledWith(500);
            expect(mockResponse.send).to.have.been.calledWith({
                message: 'Internal Service Error',
                status: 500,
                errors: error
            });
        });
    });

    describe('cancelCollaboration', () => {
        it('should cancel collaboration successfully', async () => {
            // Setup
            const cancelledCollaboration = {
                ...mockCollaboration,
                cancellationReason: 'Schedule conflict'
            };
            const req = {
                method: 'PUT',
                params: { collaborationId: 'collab-123' },
                body: { cancellationReason: 'Schedule conflict' }
            };

            CollaborationService.prototype.requestCancellation
                .resolves(cancelledCollaboration);

            // Execute
            const handler = collaborationController.cancelCollaboration;
            await handler(req, mockResponse);

            // Assert
            expect(mockResponse.send).to.have.been.calledWith({
                success: true,
                collaboration: cancelledCollaboration
            });
        });
    });

    describe('handleCancellationResponse', () => {
        it('should handle cancellation response successfully', async () => {
            // Setup
            const responseCollaboration = {
                ...mockCollaboration,
                managerDecision: 'approved'
            };
            const req = {
                method: 'PUT',
                params: { collaborationId: 'collab-123' },
                body: { decision: 'approved' }
            };

            CollaborationService.prototype.handleCancellationResponse
                .resolves(responseCollaboration);

            // Execute
            const handler = collaborationController.handleCancellationResponse;
            await handler(req, mockResponse);

            // Assert
            expect(mockResponse.send).to.have.been.calledWith({
                success: true,
                collaboration: responseCollaboration
            });
        });
    });
});
