const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
// const chaiAsPromised = require('chai-as-promised');
const mongoose = require('mongoose');
const { expect } = chai;

const CollaborationService = require('../services/collaborationService');
const CollaborationRepository = require('../repositories/collaborationRepository');

chai.use(sinonChai);
// chai.use(chaiAsPromised);
before(async () => {
    const chaiAsPromised = await import('chai-as-promised');
    chai.use(chaiAsPromised.default);
  });

describe('CollaborationService', () => {
  let collaborationService;
  let collaborationRepository;
  let sandbox;
  const mockObjectId = new mongoose.Types.ObjectId();

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    collaborationRepository = new CollaborationRepository();
    collaborationService = new CollaborationService();
    collaborationService.collaborationRepository = collaborationRepository;
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('createCollaboration', () => {
    it('should create a new collaboration with valid data', async () => {
      const collaborationData = {
        collaborationId: 'COLLAB_001',
        managerId: new mongoose.Types.ObjectId(),
        artistId: new mongoose.Types.ObjectId(),
        status: 'Pending',
        collaborationDate: new Date()
      };

      const expectedCollaboration = { ...collaborationData, _id: mockObjectId };
      sandbox.stub(collaborationRepository, 'createCollaboration').resolves(expectedCollaboration);

      const result = await collaborationService.createCollaboration(collaborationData);

      expect(result).to.deep.equal(expectedCollaboration);
      expect(collaborationRepository.createCollaboration).to.have.been.calledWith(collaborationData);
    });

    it('should handle validation errors', async () => {
      const invalidData = {
        managerId: new mongoose.Types.ObjectId()
        // Missing required fields
      };

      sandbox.stub(collaborationRepository, 'createCollaboration')
        .rejects(new mongoose.Error.ValidationError());

      await expect(collaborationService.createCollaboration(invalidData))
        .to.be.rejectedWith(mongoose.Error.ValidationError);
    });
  });

  describe('getCollaborationsByUserAndRole', () => {
    it('should get collaborations by user and role', async () => {
      const userId = new mongoose.Types.ObjectId();
      const role = 'Manager';
      const expectedCollaborations = [{
        _id: mockObjectId,
        collaborationId: 'COLLAB_001',
        managerId: userId,
        artistId: new mongoose.Types.ObjectId(),
        status: 'Pending',
        collaborationDate: new Date()
      }];

      sandbox.stub(collaborationRepository, 'getCollaborationsByUserAndRole')
        .resolves(expectedCollaborations);

      const result = await collaborationService.getCollaborationsByUserAndRole(userId, role);

      expect(result).to.deep.equal(expectedCollaborations);
      expect(collaborationRepository.getCollaborationsByUserAndRole)
        .to.have.been.calledWith(userId, role);
    });
  });

  describe('updateCollaborationStatus - Updated Implementation', () => {
    it('should throw error when collaboration not found', async () => {
      const collaborationId = mockObjectId;
      const status = 'Approved';

      sandbox.stub(collaborationRepository, 'findCollaborationById').resolves(null);

      await expect(collaborationService.updateCollaborationStatus(collaborationId, status))
        .to.be.rejectedWith('Collaboration not found');
    });

    it('should update collaboration status to Approved and update related entities', async () => {
      const collaborationId = mockObjectId;
      const artistId = new mongoose.Types.ObjectId();
      const managerId = new mongoose.Types.ObjectId();

      const mockCollaboration = {
        _id: collaborationId,
        artistId,
        managerId,
        status: 'Pending'
      };

      // Setup stubs for all repository calls
      const findCollabStub = sandbox.stub(collaborationRepository, 'findCollaborationById')
        .onFirstCall().resolves(mockCollaboration)
        .onSecondCall().resolves({ ...mockCollaboration, status: 'Approved' });

      const updateStatusStub = sandbox.stub(collaborationRepository, 'updateCollaborationStatus')
        .resolves({ ...mockCollaboration, status: 'Approved' });

      const updateManagerStub = sandbox.stub(collaborationRepository, 'updateManagerManagedArtists')
        .resolves();

      const updateArtistStub = sandbox.stub(collaborationRepository, 'updateArtistManager')
        .resolves();

      const result = await collaborationService.updateCollaborationStatus(collaborationId, 'Approved');

      expect(findCollabStub).to.have.been.calledTwice;
      expect(updateStatusStub).to.have.been.calledWith(collaborationId, 'Approved');
      expect(updateManagerStub).to.have.been.calledWith(managerId, artistId);
      expect(updateArtistStub).to.have.been.calledWith(artistId, managerId);
      expect(result.status).to.equal('Approved');
    });

   
    it('should handle errors during approval process', async () => {
      const collaborationId = mockObjectId;
      const artistId = new mongoose.Types.ObjectId();
      const managerId = new mongoose.Types.ObjectId();

      const mockCollaboration = {
        _id: collaborationId,
        artistId,
        managerId,
        status: 'Pending'
      };

      sandbox.stub(collaborationRepository, 'findCollaborationById').resolves(mockCollaboration);
      sandbox.stub(collaborationRepository, 'updateCollaborationStatus')
        .rejects(new Error('Database error'));

      await expect(collaborationService.updateCollaborationStatus(collaborationId, 'Approved'))
        .to.be.rejectedWith('Database error');
    });

    it('should handle errors during rejection process', async () => {
      const collaborationId = mockObjectId;
      const mockCollaboration = {
        _id: collaborationId,
        status: 'Pending'
      };

      sandbox.stub(collaborationRepository, 'findCollaborationById').resolves(mockCollaboration);
      sandbox.stub(collaborationRepository, 'updateCollaborationStatus')
        .rejects(new Error('Status update failed'));

      await expect(collaborationService.updateCollaborationStatus(collaborationId, 'Rejected'))
        .to.be.rejectedWith('Status update failed');
    });

    it('should verify the correct status object is passed for non-approved status', async () => {
      const collaborationId = mockObjectId;
      const status = 'Rejected';

      const mockCollaboration = {
        _id: collaborationId,
        status: 'Pending'
      };

      const findCollabStub = sandbox.stub(collaborationRepository, 'findCollaborationById')
        .onFirstCall().resolves(mockCollaboration)
        .onSecondCall().resolves({ ...mockCollaboration, status });

      const updateStatusStub = sandbox.stub(collaborationRepository, 'updateCollaborationStatus')
        .resolves({ ...mockCollaboration, status });

      await collaborationService.updateCollaborationStatus(collaborationId, status);

      expect(updateStatusStub).to.have.been.calledWith(collaborationId, status );
      expect(updateStatusStub.firstCall.args[1]).to.deep.equal('Rejected');
    });
  });

  describe('requestCancellation', () => {
    const mockObjectId = new mongoose.Types.ObjectId();

    it('should successfully request cancellation with valid data', async () => {
      const collaborationId = mockObjectId;
      const cancellationReason = 'Project timeline conflicts';
      const expectedResponse = {
        _id: collaborationId,
        status: 'CancellationRequested',
        cancellationReason
      };

      sandbox.stub(collaborationRepository, 'requestCancellation').resolves(expectedResponse);

      const result = await collaborationService.requestCancellation(collaborationId, cancellationReason);

      expect(result).to.deep.equal(expectedResponse);
      expect(collaborationRepository.requestCancellation).to.have.been.calledWith(
        collaborationId,
        cancellationReason
      );
    });

    it('should throw error when collaboration not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const cancellationReason = 'Project timeline conflicts';

      sandbox.stub(collaborationRepository, 'requestCancellation')
        .rejects(new Error('Collaboration not found'));

      await expect(collaborationService.requestCancellation(nonExistentId, cancellationReason))
        .to.be.rejectedWith('Collaboration not found');
    });

    it('should handle empty cancellation reason', async () => {
      const collaborationId = mockObjectId;
      const emptyReason = '';

      sandbox.stub(collaborationRepository, 'requestCancellation')
        .rejects(new Error('Cancellation reason is required'));

      await expect(collaborationService.requestCancellation(collaborationId, emptyReason))
        .to.be.rejectedWith('Cancellation reason is required');
    });

    it('should handle database errors during cancellation request', async () => {
      const collaborationId = mockObjectId;
      const cancellationReason = 'Project timeline conflicts';

      sandbox.stub(collaborationRepository, 'requestCancellation')
        .rejects(new Error('Database error'));

      await expect(collaborationService.requestCancellation(collaborationId, cancellationReason))
        .to.be.rejectedWith('Database error');
    });
  });

  describe('handleCancellationResponse', () => {
    const mockObjectId = new mongoose.Types.ObjectId();

    it('should successfully handle approved cancellation', async () => {
      const collaborationId = mockObjectId;
      const decision = 'Approved';
      const expectedResponse = {
        _id: collaborationId,
        status: 'Cancelled',
        cancellationApproved: true
      };

      sandbox.stub(collaborationRepository, 'handleCancellationResponse').resolves(expectedResponse);

      const result = await collaborationService.handleCancellationResponse(collaborationId, decision);

      expect(result).to.deep.equal(expectedResponse);
      expect(collaborationRepository.handleCancellationResponse).to.have.been.calledWith(
        collaborationId,
        decision
      );
    });

    it('should successfully handle rejected cancellation', async () => {
      const collaborationId = mockObjectId;
      const decision = 'Rejected';
      const expectedResponse = {
        _id: collaborationId,
        status: 'Active',
        cancellationApproved: false
      };

      sandbox.stub(collaborationRepository, 'handleCancellationResponse').resolves(expectedResponse);

      const result = await collaborationService.handleCancellationResponse(collaborationId, decision);

      expect(result).to.deep.equal(expectedResponse);
      expect(collaborationRepository.handleCancellationResponse).to.have.been.calledWith(
        collaborationId,
        decision
      );
    });

    it('should throw error when collaboration not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const decision = 'Approved';

      sandbox.stub(collaborationRepository, 'handleCancellationResponse')
        .rejects(new Error('Collaboration not found'));

      await expect(collaborationService.handleCancellationResponse(nonExistentId, decision))
        .to.be.rejectedWith('Collaboration not found');
    });

    it('should handle invalid decision value', async () => {
      const collaborationId = mockObjectId;
      const invalidDecision = 'Invalid';

      sandbox.stub(collaborationRepository, 'handleCancellationResponse')
        .rejects(new Error('Invalid cancellation decision'));

      await expect(collaborationService.handleCancellationResponse(collaborationId, invalidDecision))
        .to.be.rejectedWith('Invalid cancellation decision');
    });

    it('should handle database errors during cancellation response', async () => {
      const collaborationId = mockObjectId;
      const decision = 'Approved';

      sandbox.stub(collaborationRepository, 'handleCancellationResponse')
        .rejects(new Error('Database error'));

      await expect(collaborationService.handleCancellationResponse(collaborationId, decision))
        .to.be.rejectedWith('Database error');
    });

    it('should verify cancellation request exists before handling response', async () => {
      const collaborationId = mockObjectId;
      const decision = 'Approved';

      sandbox.stub(collaborationRepository, 'handleCancellationResponse')
        .rejects(new Error('No cancellation request found'));

      await expect(collaborationService.handleCancellationResponse(collaborationId, decision))
        .to.be.rejectedWith('No cancellation request found');
    });
  });
});