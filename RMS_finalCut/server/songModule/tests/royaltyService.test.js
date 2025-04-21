const { expect } = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const RoyaltyService = require('../services/royaltyService');
const RoyaltyRepository = require('../repositories/royaltyRepository');

describe('RoyaltyService - updateArtistFullRoyalty', () => {
  let royaltyService;
  let royaltyRepository;

  beforeEach(() => {
    // Create repository stub with required methods
    royaltyRepository = {
      findSongsByArtistId: sinon.stub(),
      updateArtistRoyalty: sinon.stub()
    };

    // Create service instance and inject repository stub
    royaltyService = new RoyaltyService();
    royaltyService.royaltyRepository = royaltyRepository;
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should successfully calculate and update artist royalty totals', async () => {
    // Arrange
    const artistId = new mongoose.Types.ObjectId().toString();
    const mockSongs = [
      {
        totalStreams: 1000,
        totalRoyalty: 100,
        royaltyPaid: 60,
        royaltyDue: 40
      },
      {
        totalStreams: 2000,
        totalRoyalty: 200,
        royaltyPaid: 120,
        royaltyDue: 80
      }
    ];

    royaltyRepository.findSongsByArtistId.resolves(mockSongs);
    royaltyRepository.updateArtistRoyalty.resolves({
      totalStreams: 3000,
      totalRoyalty: 300,
      royaltyPaid: 180,
      royaltyDue: 120
    });

    // Act
    await royaltyService.updateArtistFullRoyalty(artistId);

    // Assert
    expect(royaltyRepository.findSongsByArtistId.calledOnce).to.be.true;
    expect(royaltyRepository.findSongsByArtistId.calledWith(artistId)).to.be.true;
    
    expect(royaltyRepository.updateArtistRoyalty.calledOnce).to.be.true;
    expect(royaltyRepository.updateArtistRoyalty.firstCall.args).to.deep.equal([
      artistId,
      300,  // totalRoyalty
      180,  // totalRoyaltyPaid
      120,  // totalRoyaltyDue
      3000  // totalStreams
    ]);
  });

  it('should handle songs with missing or null values', async () => {
    // Arrange
    const artistId = new mongoose.Types.ObjectId().toString();
    const mockSongs = [
      {
        totalStreams: 1000,
        totalRoyalty: 100,
        royaltyPaid: null,
        royaltyDue: 100
      },
      {
        totalStreams: null,
        totalRoyalty: undefined,
        royaltyPaid: 50,
        royaltyDue: undefined
      }
    ];

    royaltyRepository.findSongsByArtistId.resolves(mockSongs);
    royaltyRepository.updateArtistRoyalty.resolves({
      totalStreams: 1000,
      totalRoyalty: 100,
      royaltyPaid: 50,
      royaltyDue: 100
    });

    // Act
    await royaltyService.updateArtistFullRoyalty(artistId);

    // Assert
    expect(royaltyRepository.updateArtistRoyalty.calledOnce).to.be.true;
    expect(royaltyRepository.updateArtistRoyalty.firstCall.args).to.deep.equal([
      artistId,
      100,  // totalRoyalty
      50,   // totalRoyaltyPaid
      100,  // totalRoyaltyDue
      1000  // totalStreams
    ]);
  });

  it('should handle empty song list', async () => {
    // Arrange
    const artistId = new mongoose.Types.ObjectId().toString();
    royaltyRepository.findSongsByArtistId.resolves([]);

    // Act
    await royaltyService.updateArtistFullRoyalty(artistId);

    // Assert
    expect(royaltyRepository.updateArtistRoyalty.calledOnce).to.be.true;
    expect(royaltyRepository.updateArtistRoyalty.firstCall.args).to.deep.equal([
      artistId,
      0,  // totalRoyalty
      0,  // totalRoyaltyPaid
      0,  // totalRoyaltyDue
      0   // totalStreams
    ]);
  });

  it('should handle repository errors', async () => {
    // Arrange
    const artistId = new mongoose.Types.ObjectId().toString();
    const expectedError = new Error('Database error');
    royaltyRepository.findSongsByArtistId.rejects(expectedError);

    // Act & Assert
    try {
      await royaltyService.updateArtistFullRoyalty(artistId);
      expect.fail('Should have thrown an error');
    } catch (error) {
      expect(error).to.equal(expectedError);
      expect(royaltyRepository.findSongsByArtistId.calledOnce).to.be.true;
      expect(royaltyRepository.updateArtistRoyalty.called).to.be.false;
    }
  });
});

describe('RoyaltyService - getRoyaltyById', () => {
    let royaltyService;
    let royaltyRepository;
  
    beforeEach(() => {
      // Create repository stub with required methods
      royaltyRepository = {
        findById: sinon.stub(),
        findSongsByArtistId: sinon.stub(),
        updateArtistRoyalty: sinon.stub()
      };
  
      // Create service instance and inject repository stub
      royaltyService = new RoyaltyService();
      royaltyService.royaltyRepository = royaltyRepository;
    });
  
    afterEach(() => {
      sinon.restore();
    });
  
    it('should return null when royalty is not found', async () => {
      // Arrange
      const royaltyId = new mongoose.Types.ObjectId();
      royaltyRepository.findById.resolves(null);
  
      // Act
      const result = await royaltyService.getRoyaltyById(royaltyId);
  
      // Assert
      expect(result).to.be.null;
      expect(royaltyRepository.findById.calledOnce).to.be.true;
      expect(royaltyRepository.findById.calledWith(royaltyId)).to.be.true;
    });
  
    it('should return royalty and update artist full royalty when royalty is found', async () => {
        // Arrange
        const royaltyId = new mongoose.Types.ObjectId();
        const artistId = new mongoose.Types.ObjectId();
        const mockRoyalty = {
          _id: royaltyId,
          artistId: artistId,
          amount: 100
        };
    
        // Mock the songs data
        const mockSongs = [
          { _id: new mongoose.Types.ObjectId(), royaltyAmount: 50 },
          { _id: new mongoose.Types.ObjectId(), royaltyAmount: 50 }
        ];
        
        // Setup stubs
        royaltyRepository.findById.resolves(mockRoyalty);
        royaltyRepository.findSongsByArtistId.resolves(mockSongs);
        royaltyRepository.updateArtistRoyalty.resolves();
    
        // Setup spy on the updateArtistFullRoyalty method
        const updateArtistFullRoyaltySpy = sinon.stub(royaltyService, 'updateArtistFullRoyalty').resolves();
    
        // Act
        const result = await royaltyService.getRoyaltyById(royaltyId);
    
        // Assert
        expect(result).to.deep.equal(mockRoyalty);
        expect(royaltyRepository.findById.calledOnce).to.be.true;
        expect(royaltyRepository.findById.calledWith(royaltyId)).to.be.true;
        expect(updateArtistFullRoyaltySpy.calledOnce).to.be.true;
        expect(updateArtistFullRoyaltySpy.firstCall.args[0]).to.equal(artistId);
      });
  
    it('should handle errors properly', async () => {
      // Arrange
      const royaltyId = new mongoose.Types.ObjectId();
      const error = new Error('Database error');
      royaltyRepository.findById.rejects(error);
  
      // Act & Assert
      try {
        await royaltyService.getRoyaltyById(royaltyId);
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err).to.equal(error);
        expect(royaltyRepository.findById.calledOnce).to.be.true;
        expect(royaltyRepository.findById.calledWith(royaltyId)).to.be.true;
      }
    });
  });


  describe('RoyaltyService - getRoyaltyByArtistId', () => {
    let royaltyService;
    let royaltyRepository;
  
    beforeEach(() => {
      // Create repository stub with required methods
      royaltyRepository = {
        findByArtistId: sinon.stub(),
        findSongsByArtistId: sinon.stub(),
        updateArtistRoyalty: sinon.stub()
      };
  
      // Create service instance and inject repository stub
      royaltyService = new RoyaltyService();
      royaltyService.royaltyRepository = royaltyRepository;
    });
  
    afterEach(() => {
      sinon.restore();
    });
  
    it('should return royalties and update artist full royalty when royalties are found', async () => {
      // Arrange
      const artistId = new mongoose.Types.ObjectId();
      const mockRoyalties = [
        {
          _id: new mongoose.Types.ObjectId(),
          artistId: artistId,
          amount: 100
        },
        {
          _id: new mongoose.Types.ObjectId(),
          artistId: artistId,
          amount: 150
        }
      ];
  
      // Mock the songs data
      const mockSongs = [
        { _id: new mongoose.Types.ObjectId(), royaltyAmount: 50 },
        { _id: new mongoose.Types.ObjectId(), royaltyAmount: 50 }
      ];
      
      // Setup stubs
      royaltyRepository.findByArtistId.resolves(mockRoyalties);
      royaltyRepository.findSongsByArtistId.resolves(mockSongs);
      royaltyRepository.updateArtistRoyalty.resolves();
  
      // Setup spy on the updateArtistFullRoyalty method
      const updateArtistFullRoyaltySpy = sinon.stub(royaltyService, 'updateArtistFullRoyalty').resolves();
  
      // Act
      const result = await royaltyService.getRoyaltyByArtistId(artistId);
  
      // Assert
      expect(result).to.deep.equal(mockRoyalties);
      expect(royaltyRepository.findByArtistId.calledOnce).to.be.true;
      expect(royaltyRepository.findByArtistId.calledWith(artistId)).to.be.true;
      expect(updateArtistFullRoyaltySpy.calledOnce).to.be.true;
      expect(updateArtistFullRoyaltySpy.firstCall.args[0]).to.equal(artistId);
    });
  
    it('should return empty array and not update artist full royalty when no royalties are found', async () => {
      // Arrange
      const artistId = new mongoose.Types.ObjectId();
      const mockRoyalties = [];
      
      royaltyRepository.findByArtistId.resolves(mockRoyalties);
      const updateArtistFullRoyaltySpy = sinon.stub(royaltyService, 'updateArtistFullRoyalty').resolves();
  
      // Act
      const result = await royaltyService.getRoyaltyByArtistId(artistId);
  
      // Assert
      expect(result).to.deep.equal([]);
      expect(royaltyRepository.findByArtistId.calledOnce).to.be.true;
      expect(royaltyRepository.findByArtistId.calledWith(artistId)).to.be.true;
      expect(updateArtistFullRoyaltySpy.called).to.be.false;
    });
  
    it('should handle errors properly', async () => {
      // Arrange
      const artistId = new mongoose.Types.ObjectId();
      const error = new Error('Database error');
      royaltyRepository.findByArtistId.rejects(error);
  
      // Act & Assert
      try {
        await royaltyService.getRoyaltyByArtistId(artistId);
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err).to.equal(error);
        expect(royaltyRepository.findByArtistId.calledOnce).to.be.true;
        expect(royaltyRepository.findByArtistId.calledWith(artistId)).to.be.true;
      }
    });
  
    it('should console.log the royalties', async () => {
      // Arrange
      const artistId = new mongoose.Types.ObjectId();
      const mockRoyalties = [
        {
          _id: new mongoose.Types.ObjectId(),
          artistId: artistId,
          amount: 100
        }
      ];
      
      royaltyRepository.findByArtistId.resolves(mockRoyalties);
      const updateArtistFullRoyaltySpy = sinon.stub(royaltyService, 'updateArtistFullRoyalty').resolves();
      
      // Spy on console.log
      const consoleLogSpy = sinon.spy(console, 'log');
  
      // Act
      const result = await royaltyService.getRoyaltyByArtistId(artistId);
  
      // Assert
      expect(consoleLogSpy.calledWith(mockRoyalties, "inside service")).to.be.true;
      
      // Restore console.log
      consoleLogSpy.restore();
    });
  });


  describe('RoyaltyService - createRoyalty', () => {
    let royaltyService;
    let royaltyRepository;
  
    beforeEach(() => {
      // Create repository stub with required methods
      royaltyRepository = {
        create: sinon.stub(),
        findSongsByArtistId: sinon.stub(),
        updateArtistRoyalty: sinon.stub()
      };
  
      // Create service instance and inject repository stub
      royaltyService = new RoyaltyService();
      royaltyService.royaltyRepository = royaltyRepository;
    });
  
    afterEach(() => {
      sinon.restore();
    });
  
    it('should create a new royalty and update artist full royalty successfully', async () => {
      // Arrange
      const royaltyId = new mongoose.Types.ObjectId();
      const artistId = new mongoose.Types.ObjectId();
      const songId = new mongoose.Types.ObjectId();
  
      const royaltyData = {
        royaltyId,
        artistId,
        songId
      };
  
      const mockCreatedRoyalty = {
        _id: royaltyId,
        artistId: artistId,
        songId: songId,
        amount: 100
      };
  
      // Setup stubs
      royaltyRepository.create.resolves(mockCreatedRoyalty);
      const updateArtistFullRoyaltySpy = sinon.stub(royaltyService, 'updateArtistFullRoyalty').resolves();
  
      // Act
      const result = await royaltyService.createRoyalty(royaltyData);
  
      // Assert
      expect(result).to.deep.equal(mockCreatedRoyalty);
      expect(royaltyRepository.create.calledOnce).to.be.true;
      expect(royaltyRepository.create.calledWith(royaltyId, artistId, songId)).to.be.true;
      expect(updateArtistFullRoyaltySpy.calledOnce).to.be.true;
      expect(updateArtistFullRoyaltySpy.calledWith(artistId)).to.be.true;
    });
  
    it('should handle errors during royalty creation', async () => {
      // Arrange
      const royaltyData = {
        royaltyId: new mongoose.Types.ObjectId(),
        artistId: new mongoose.Types.ObjectId(),
        songId: new mongoose.Types.ObjectId()
      };
  
      const error = new Error('Database error');
      royaltyRepository.create.rejects(error);
  
      // Act & Assert
      try {
        await royaltyService.createRoyalty(royaltyData);
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err).to.equal(error);
        expect(royaltyRepository.create.calledOnce).to.be.true;
      }
    });
  
    it('should handle errors during artist royalty update', async () => {
      // Arrange
      const royaltyData = {
        royaltyId: new mongoose.Types.ObjectId(),
        artistId: new mongoose.Types.ObjectId(),
        songId: new mongoose.Types.ObjectId()
      };
  
      const mockCreatedRoyalty = {
        _id: royaltyData.royaltyId,
        artistId: royaltyData.artistId,
        songId: royaltyData.songId,
        amount: 100
      };
  
      const error = new Error('Update error');
      royaltyRepository.create.resolves(mockCreatedRoyalty);
      const updateArtistFullRoyaltySpy = sinon.stub(royaltyService, 'updateArtistFullRoyalty').rejects(error);
  
      // Act & Assert
      try {
        await royaltyService.createRoyalty(royaltyData);
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err).to.equal(error);
        expect(royaltyRepository.create.calledOnce).to.be.true;
        expect(updateArtistFullRoyaltySpy.calledOnce).to.be.true;
      }
    });
  
    it('should handle completely empty data', async () => {
        // Arrange
        const invalidRoyaltyData = {};
      
        // Act & Assert
        try {
          await royaltyService.createRoyalty(invalidRoyaltyData);
          expect.fail('Should have thrown an error');
        } catch (error) {
          expect(error.message).to.equal('Cannot read properties of undefined (reading \'reduce\')');
          expect(royaltyRepository.create.called).to.be.true;
        }
    });
  });