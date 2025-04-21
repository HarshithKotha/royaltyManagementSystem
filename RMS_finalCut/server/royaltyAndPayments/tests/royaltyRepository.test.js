const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const mongoose = require('mongoose');
const { expect } = chai;
chai.use(sinonChai);
// const RoyaltyService = require('../../services/royaltyService');
const RoyaltyRepository = require('../repositories/royaltyRepository');
const Royalty = require('../models/royaltyModel');
const Song = require('../models/songModel');
const Artist = require('../models/artistModel');

describe('RoyaltyRepository', () => {
    let royaltyRepository;
    let findOneStub;

    beforeEach(() => {
        // Initialize repository
        royaltyRepository = new RoyaltyRepository();
        
        // Create stub for Royalty model's findOne method
        findOneStub = sinon.stub(Royalty, 'findOne');
    });

    afterEach(() => {
        // Restore all stubs
        sinon.restore();
    });

    describe('findById', () => {
        it('should successfully find a royalty by id', async () => {
            // Arrange
            const royaltyId = new mongoose.Types.ObjectId();
            const expectedRoyalty = {
                royaltyId,
                artistId: new mongoose.Types.ObjectId(),
                songId: new mongoose.Types.ObjectId()
            };
            findOneStub.resolves(expectedRoyalty);

            // Act
            const result = await royaltyRepository.findById(royaltyId);

            // Assert
            expect(result).to.deep.equal(expectedRoyalty);
            expect(findOneStub).to.have.been.calledOnce;
            expect(findOneStub).to.have.been.calledWith({ royaltyId });
        });

        it('should return null for non-existent royalty', async () => {
            // Arrange
            const nonExistentId = new mongoose.Types.ObjectId();
            findOneStub.resolves(null);

            // Act
            const result = await royaltyRepository.findById(nonExistentId);

            // Assert
            expect(result).to.be.null;
            expect(findOneStub).to.have.been.calledOnce;
            expect(findOneStub).to.have.been.calledWith({ royaltyId: nonExistentId });
        });

        it('should handle undefined royaltyId', async () => {
            // Arrange
            findOneStub.resolves(null);

            // Act
            const result = await royaltyRepository.findById(undefined);

            // Assert
            expect(result).to.be.null;
            expect(findOneStub).to.have.been.calledOnce;
            expect(findOneStub).to.have.been.calledWith({ royaltyId: undefined });
        });

        it('should handle database query errors', async () => {
            // Arrange
            const royaltyId = new mongoose.Types.ObjectId();
            const dbError = new Error('Database query failed');
            findOneStub.rejects(dbError);

            // Act & Assert
            try {
                await royaltyRepository.findById(royaltyId);
                expect.fail('Should have thrown an error');
            } catch (error) {
                expect(error.message).to.equal('Database query failed');
                expect(findOneStub).to.have.been.calledOnce;
                expect(findOneStub).to.have.been.calledWith({ royaltyId });
            }
        });

        it('should find royalty with valid ObjectId as string', async () => {
            // Arrange
            const royaltyId = new mongoose.Types.ObjectId().toString();
            const expectedRoyalty = {
                royaltyId,
                artistId: new mongoose.Types.ObjectId(),
                songId: new mongoose.Types.ObjectId()
            };
            findOneStub.resolves(expectedRoyalty);

            // Act
            const result = await royaltyRepository.findById(royaltyId);

            // Assert
            expect(result).to.deep.equal(expectedRoyalty);
            expect(findOneStub).to.have.been.calledOnce;
            expect(findOneStub).to.have.been.calledWith({ royaltyId });
        });
    });
});



describe('RoyaltyRepository', () => {
    let royaltyRepository;
    let findRoyaltyStub;
    let findSongStub;
    let updateArtistStub;
    let consoleLogStub;

    beforeEach(() => {
        royaltyRepository = new RoyaltyRepository();
        findRoyaltyStub = sinon.stub(Royalty, 'find');
        findSongStub = sinon.stub(Song, 'find');
        updateArtistStub = sinon.stub(Artist, 'findOneAndUpdate');
        consoleLogStub = sinon.stub(console, 'log');
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('findByArtistId', () => {
        it('should successfully find royalties by artist id', async () => {
            // Arrange
            const artistId = new mongoose.Types.ObjectId();
            const populateStub = sinon.stub();
            populateStub.returns({
                populate: sinon.stub().resolves([{
                    artistId: { _id: artistId, name: 'Test Artist' },
                    songId: { _id: new mongoose.Types.ObjectId(), title: 'Test Song' }
                }])
            });
            findRoyaltyStub.returns({ populate: populateStub });

            // Act
            const result = await royaltyRepository.findByArtistId(artistId);

            // Assert
            expect(findRoyaltyStub).to.have.been.calledWith({ artistId: artistId });
           
            expect(result).to.be.an('array');
            expect(result[0].artistId.name).to.equal('Test Artist');
        });

        it('should return empty array when no royalties found', async () => {
            // Arrange
            const artistId = new mongoose.Types.ObjectId();
            const populateStub = sinon.stub();
            populateStub.returns({
                populate: sinon.stub().resolves([])
            });
            findRoyaltyStub.returns({ populate: populateStub });

            // Act
            const result = await royaltyRepository.findByArtistId(artistId);

            // Assert
            expect(result).to.be.an('array').that.is.empty;
        });
    });

    describe('findSongsByArtistId', () => {
        it('should successfully find songs by artist id', async () => {
            // Arrange
            const artistId = new mongoose.Types.ObjectId();
            const expectedSongs = [
                { _id: new mongoose.Types.ObjectId(), title: 'Song 1' },
                { _id: new mongoose.Types.ObjectId(), title: 'Song 2' }
            ];
            findSongStub.resolves(expectedSongs);

            // Act
            const result = await royaltyRepository.findSongsByArtistId(artistId);

            // Assert
            expect(findSongStub).to.have.been.calledWith({ artistId: artistId });
            expect(result).to.deep.equal(expectedSongs);
        });

        it('should return empty array when no songs found', async () => {
            // Arrange
            const artistId = new mongoose.Types.ObjectId();
            findSongStub.resolves([]);

            // Act
            const result = await royaltyRepository.findSongsByArtistId(artistId);

            // Assert
            expect(result).to.be.an('array').that.is.empty;
        });

        it('should handle database errors', async () => {
            // Arrange
            const artistId = new mongoose.Types.ObjectId();
            findSongStub.rejects(new Error('Database error'));

            // Act & Assert
            try {
                await royaltyRepository.findSongsByArtistId(artistId);
                expect.fail('Should have thrown an error');
            } catch (error) {
                expect(error.message).to.equal('Database error');
            }
        });
    });

    describe('updateArtistRoyalty', () => {
        it('should successfully update artist royalty', async () => {
            // Arrange
            const artistId = new mongoose.Types.ObjectId();
            const updatedArtist = {
                _id: artistId,
                fullRoyalty: 1000,
                totalRoyaltyPaid: 500,
                totalRoyaltyDue: 500,
                totalStreams: 10000
            };
            updateArtistStub.resolves(updatedArtist);

            // Act
            const result = await royaltyRepository.updateArtistRoyalty(
                artistId,
                1000,
                500,
                500,
                10000
            );

            // Assert
            expect(updateArtistStub).to.have.been.calledWith(
                { _id: artistId },
                {
                    fullRoyalty: 1000,
                    totalRoyaltyPaid: 500,
                    totalRoyaltyDue: 500,
                    totalStreams: 10000
                }
            );
            expect(result).to.deep.equal(updatedArtist);
        });

        it('should handle non-existent artist', async () => {
            // Arrange
            const artistId = new mongoose.Types.ObjectId();
            updateArtistStub.resolves(null);

            // Act
            const result = await royaltyRepository.updateArtistRoyalty(
                artistId,
                1000,
                500,
                500,
                10000
            );

            // Assert
            expect(result).to.be.null;
        });

        it('should handle database errors', async () => {
            // Arrange
            const artistId = new mongoose.Types.ObjectId();
            updateArtistStub.rejects(new Error('Database error'));

            // Act & Assert
            try {
                await royaltyRepository.updateArtistRoyalty(
                    artistId,
                    1000,
                    500,
                    500,
                    10000
                );
                expect.fail('Should have thrown an error');
            } catch (error) {
                expect(error.message).to.equal('Database error');
            }
        });
    });
});


describe('Royalty Repository - create', function () {
    let royaltyRepository;
    let saveStub;
  
    beforeEach(function () {
      sinon.restore(); // Reset all stubs before each test
      royaltyRepository = new RoyaltyRepository();
  
      // Stub the Mongoose model's save function
      saveStub = sinon.stub(Royalty.prototype, 'save');
    });
  
    afterEach(function () {
      sinon.restore(); // Restore all stubs after each test
    });
  
    it('should create and return a royalty object when valid data is provided', async function () {
      // Arrange: Create valid ObjectIds
      const royaltyId = 'venu-krithik'; // Example string-based ID
      const artistId = new mongoose.Types.ObjectId();
      const songId = new mongoose.Types.ObjectId();
  
      // Mock saved royalty object
      const mockRoyalty = {
        _id: new mongoose.Types.ObjectId(),
        royaltyId,
        artistId,
        songId,
        createdAt: new Date(),
      };
  
      saveStub.resolves(mockRoyalty); // Stub save() to return mockRoyalty
  
      // Act: Call the function
      const result = await royaltyRepository.create(royaltyId, artistId, songId);
  
      // Assert: Verify behavior and results
      expect(saveStub.calledOnce).to.be.true;
      expect(result).to.deep.equal(mockRoyalty);
    });
  
    // it('should throw an error when required fields are missing', async function () {
    //     try {
    //       await royaltyRepository.create(null, null, null); 
    //       expect.fail('Should have thrown an error'); 
    //     } catch (error) {
    //       console.error('Validation Error:', error.message);
      
    //       expect(error).to.be.instanceOf(Error); 
    //       expect(error.message).to.include('Royalty validation failed'); 
    //       expect(error.message).to.include('Path `royaltyId` is required'); 
    //       expect(error.message).to.include('Path `artistId` is required'); 
    //       expect(error.message).to.include('Path `songId` is required');
    //     }
    //   });
      
      
      
  
    it('should throw a database error when saving fails', async function () {
      // Arrange
      const royaltyId = 'venu-krithik';
      const artistId = new mongoose.Types.ObjectId();
      const songId = new mongoose.Types.ObjectId();
      
      const dbError = new Error('Database save failed');
      saveStub.rejects(dbError); // Force save to fail
  
      try {
        await royaltyRepository.create(royaltyId, artistId, songId);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).to.equal(dbError);
        expect(error.message).to.equal('Database save failed');
      }
    });
  });