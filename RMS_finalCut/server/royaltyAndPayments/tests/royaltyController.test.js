const { expect } = require("chai");
const sinon = require("sinon");

// Import the controller to test
const royaltyController = require("../controllers/royaltyController");

// We'll need to mock the service that the controller depends on
const RoyaltyService = require("../services/royaltyService");

describe("Royalty Controller Tests", function() {
  let sandbox;
  let mockRoyaltyService;
  
  beforeEach(function() {
    // Create a sandbox for sinon stubs
    sandbox = sinon.createSandbox();
    
    // Create mock methods that will replace the actual service methods
    mockRoyaltyService = {
      createRoyalty: sandbox.stub(),
      getRoyaltyById: sandbox.stub(),
      getRoyaltyByArtistId: sandbox.stub()
    };
    
    // Stub the service methods directly on the controller's service instance
    sandbox.stub(RoyaltyService.prototype, "createRoyalty")
      .callsFake(mockRoyaltyService.createRoyalty);
    sandbox.stub(RoyaltyService.prototype, "getRoyaltyById")
      .callsFake(mockRoyaltyService.getRoyaltyById);
    sandbox.stub(RoyaltyService.prototype, "getRoyaltyByArtistId")
      .callsFake(mockRoyaltyService.getRoyaltyByArtistId);
  });
  
  afterEach(function() {
    // Restore all stubs and mocks
    sandbox.restore();
  });
  
  describe("createRoyaltyController", function() {
    it("should successfully create a royalty", async function() {
      // Setup test data
      const royaltyData = {
        artistId: "artist-123",
        songId: "song-456",
        artistName: "John Doe",
        songName: "Amazing Song"
      };
      
      const expectedRoyaltyId = "John Doe-amazing-song";
      const createdRoyalty = {
        royaltyId: expectedRoyaltyId,
        artistId: royaltyData.artistId,
        songId: royaltyData.songId,
        amount: 0
      };
      
      // Configure mock behavior
      mockRoyaltyService.createRoyalty.resolves(createdRoyalty);
      
      // Setup request and response mocks
      const req = {
        method: "POST",
        body: royaltyData,
        path: "/royalties",
        url: "/api/royalties",
        params: {},
        query: {}
      };
      
      const res = {
        status: sandbox.stub().returnsThis(),
        send: sandbox.stub()
      };
      
      // Execute the controller
      await royaltyController.createRoyaltyController(req, res);
      
      // Assertions
      expect(mockRoyaltyService.createRoyalty.calledOnce).to.be.true;
      expect(mockRoyaltyService.createRoyalty.firstCall.args[0]).to.deep.include({
        royaltyId: expectedRoyaltyId,
        artistId: royaltyData.artistId,
        songId: royaltyData.songId
      });
      
      expect(res.status.calledWith(201)).to.be.true;
      expect(res.send.calledWith({
        success: true,
        royalty: createdRoyalty
      })).to.be.true;
    });
    
    it("should handle errors when creating royalty", async function() {
      // Setup test data
      const royaltyData = {
        artistId: "artist-123",
        songId: "song-456",
        artistName: "John Doe",
        songName: "Amazing Song"
      };
      
      const error = new Error("Database error");
      mockRoyaltyService.createRoyalty.rejects(error);
      
      // Setup request and response mocks
      const req = {
        method: "POST",
        body: royaltyData,
        path: "/royalties",
        url: "/api/royalties",
        params: {},
        query: {}
      };
      
      const res = {
        status: sandbox.stub().returnsThis(),
        send: sandbox.stub(),
        set: sandbox.stub()
      };
      
      // Execute the controller
      await royaltyController.createRoyaltyController(req, res);
      
      // Verify error handling - the routeHandler will handle the error
      expect(res.status.called).to.be.true;
      expect(res.send.called).to.be.true;
      
      // The status code should be an error code
      const statusCode = res.status.firstCall.args[0];
      expect(statusCode).to.be.at.least(400);
    });
  });
  
  describe("getRoyaltyByIdController", function() {
    it("should successfully get a royalty by ID", async function() {
      // Setup test data
      const royaltyId = "john-doe-amazing-song";
      const royalty = {
        royaltyId,
        artistId: "artist-123",
        songId: "song-456",
        amount: 150
      };
      
      // Configure mock behavior
      mockRoyaltyService.getRoyaltyById.resolves(royalty);
      
      // Setup request and response mocks
      const req = {
        method: "GET",
        params: { royaltyId },
        path: `/royalties/${royaltyId}`,
        url: `/api/royalties/${royaltyId}`,
        query: {}
      };
      
      const res = {
        status: sandbox.stub().returnsThis(),
        send: sandbox.stub()
      };
      
      // Execute the controller
      await royaltyController.getRoyaltyByIdController(req, res);
      
      // Assertions
      expect(mockRoyaltyService.getRoyaltyById.calledOnceWith(royaltyId)).to.be.true;
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.send.calledWith({
        success: true,
        royalty
      })).to.be.true;
    });
    
    it("should handle not found when getting royalty by ID", async function() {
      // Setup test data
      const royaltyId = "nonexistent-royalty";
      const error = new Error("Royalty not found");
      mockRoyaltyService.getRoyaltyById.rejects(error);
      
      // Setup request and response mocks
      const req = {
        method: "GET",
        params: { royaltyId },
        path: `/royalties/${royaltyId}`,
        url: `/api/royalties/${royaltyId}`,
        query: {}
      };
      
      const res = {
        status: sandbox.stub().returnsThis(),
        send: sandbox.stub(),
        set: sandbox.stub()
      };
      
      // Execute the controller
      await royaltyController.getRoyaltyByIdController(req, res);
      
      // Verify error handling
      expect(res.status.called).to.be.true;
      expect(res.send.called).to.be.true;
      
      // For not found errors, typically expect 404
      const responseBody = res.send.firstCall.args[0];
      expect(responseBody).to.have.property('message');
    });
  });
  
  describe("getRoyaltyByArtistIdController", function() {
    it("should successfully get royalties by artist ID", async function() {
      // Setup test data
      const artistId = "artist-123";
      const royalties = [
        {
          royaltyId: "john-doe-amazing-song",
          artistId,
          songId: "song-456",
          amount: 150
        },
        {
          royaltyId: "john-doe-another-song",
          artistId,
          songId: "song-789",
          amount: 200
        }
      ];
      
      // Configure mock behavior
      mockRoyaltyService.getRoyaltyByArtistId.resolves(royalties);
      
      // Setup request and response mocks
      const req = {
        method: "GET",
        params: { artistId },
        path: `/royalties/artist/${artistId}`,
        url: `/api/royalties/artist/${artistId}`,
        query: {}
      };
      
      const res = {
        status: sandbox.stub().returnsThis(),
        send: sandbox.stub()
      };
      
      // Execute the controller
      await royaltyController.getRoyaltyByArtistIdController(req, res);
      
      // Assertions
      expect(mockRoyaltyService.getRoyaltyByArtistId.calledOnceWith(artistId)).to.be.true;
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.send.calledWith({
        success: true,
        royalties
      })).to.be.true;
    });
    
    it("should return empty array when artist has no royalties", async function() {
      // Setup test data
      const artistId = "artist-no-royalties";
      mockRoyaltyService.getRoyaltyByArtistId.resolves([]);
      
      // Setup request and response mocks
      const req = {
        method: "GET",
        params: { artistId },
        path: `/royalties/artist/${artistId}`,
        url: `/api/royalties/artist/${artistId}`,
        query: {}
      };
      
      const res = {
        status: sandbox.stub().returnsThis(),
        send: sandbox.stub()
      };
      
      // Execute the controller
      await royaltyController.getRoyaltyByArtistIdController(req, res);
      
      // Assertions
      expect(mockRoyaltyService.getRoyaltyByArtistId.calledOnceWith(artistId)).to.be.true;
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.send.calledWith({
        success: true,
        royalties: []
      })).to.be.true;
    });
    
    it("should handle errors when getting royalties by artist ID", async function() {
      // Setup test data
      const artistId = "invalid-artist";
      const error = new Error("Database error");
      mockRoyaltyService.getRoyaltyByArtistId.rejects(error);
      
      // Setup request and response mocks
      const req = {
        method: "GET",
        params: { artistId },
        path: `/royalties/artist/${artistId}`,
        url: `/api/royalties/artist/${artistId}`,
        query: {}
      };
      
      const res = {
        status: sandbox.stub().returnsThis(),
        send: sandbox.stub(),
        set: sandbox.stub()
      };
      
      // Execute the controller
      await royaltyController.getRoyaltyByArtistIdController(req, res);
      
      // Verify error handling
      expect(res.status.called).to.be.true;
      expect(res.send.called).to.be.true;
    });
  });
});