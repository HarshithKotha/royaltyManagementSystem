const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
// const chaiAsPromised = require('chai-as-promised');
const { expect } = chai;
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

chai.use(sinonChai);
// chai.use(chaiAsPromised);
before(async () => {
    const chaiAsPromised = await import('chai-as-promised');
    chai.use(chaiAsPromised.default);
  });

// Import modules
const SongService = require('../services/songService');
const SongRepository = require('../repositories/songRepository');
const RoyaltyService = require('../services/royaltyService');

describe('SongService', function() {
  // Increase the timeout for all tests in this suite
  this.timeout(10000);
  
  let songService;
  let songRepositoryStub;
  let royaltyServiceStub;

  beforeEach(function() {
    // Create stubs
    songRepositoryStub = {
      createSong: sinon.stub(),
      findSongById: sinon.stub(),
      findSongsByArtistId: sinon.stub(),
      findSongsBySongId: sinon.stub(),
      modifySong: sinon.stub(),
      removeSong: sinon.stub(),
      addSongToArtist: sinon.stub(),
      removeSongFromArtist: sinon.stub(),
      deleteRoyalty: sinon.stub()
    };

   
    // royaltyServiceStub = sinon.stub(RoyaltyService, 'createRoyalty');
    royaltyServiceStub = {
        createRoyalty: sinon.stub()
      };

    // Create service instance
    songService = new SongService();
    songService.songRepository = songRepositoryStub;
    songService.royaltyService = royaltyServiceStub;
  });

  global.royaltyService = royaltyServiceStub;

  afterEach(function() {
    sinon.restore();
    delete global.royaltyService;
  });

//   describe('uploadSong', function() {
//     it('should upload a song and create royalty record', async function() {
//       // Arrange
//       const artistId = new ObjectId();
//       const songObjectId = new ObjectId();
//       const artistName = 'Test Artist';
//       const songName = 'Test Song';
      
//       const songData = {
//         artistId: artistId.toString(),
//         songId: 'test-song',
//         artistName,
//         songName
//       };
      
//       const createdSong = { 
//         _id: songObjectId,
//         artistId,
//         songId: 'test-song',
//         artistName,
//         songName
//       };
      
//       const expectedRoyaltyId = `${artistName}-${songData.songId}`;
//       const newRoyalty = {
//         _id: new ObjectId(),
//         royaltyId: expectedRoyaltyId,
//         artistId,
//         songId: songObjectId
//       };
      
//       // Setup stubs
//       songRepositoryStub.createSong.resolves(createdSong);
//       songRepositoryStub.addSongToArtist.resolves({ _id: artistId, songs: [songObjectId] });
//     //   royaltyServiceStub.resolves(newRoyalty);
//     royaltyServiceStub.createRoyalty.resolves(newRoyalty);
      
//       // Act
//       const result = await songService.uploadSong(songData, artistName, songName);
      
//       // Assert
//       expect(songRepositoryStub.createSong).to.have.been.calledWith(songData);
//       expect(songRepositoryStub.addSongToArtist).to.have.been.calledWith(
//         artistId.toString(),
//         songObjectId
//       );
      
//       expect(royaltyServiceStub).to.have.been.calledWith({
//         royaltyId: expectedRoyaltyId,
//         artistId,
//         songId: songObjectId
//       });
      
//       expect(result).to.deep.equal({
//         song: createdSong,
//         newRoyalty
//       });
//     });

//     it('should handle errors during song upload', async function() {
//       const artistId = new ObjectId();
//       const artistName = 'Test Artist';
//       const songName = 'Test Song';
      
//       const songData = {
//         artistId: artistId.toString(),
//         songId: 'test-song',
//         artistName,
//         songName
//       };
      
//       songRepositoryStub.createSong.rejects(new Error('Database error'));
      
//       try {
//         await songService.uploadSong(songData, artistName, songName);
//         expect.fail('Should have thrown an error');
//       } catch (error) {
//         expect(error.message).to.equal('Database error');
//       }
//     });
//   });


  describe('getSongById', function() {
    it('should return a song by its ID', async function() {
      // Arrange
      const songId = 'test-song';
      const expectedSong = {
        _id: new ObjectId(),
        songId,
        songName: 'Test Song',
        artistId: new ObjectId()
      };
      
      songRepositoryStub.findSongById.resolves(expectedSong);
      
      // Act
      const result = await songService.getSongById(songId);
      
      // Assert
      expect(songRepositoryStub.findSongById).to.have.been.calledWith(songId);
      expect(result).to.deep.equal(expectedSong);
    });
    
    it('should handle null return values', async function() {
      // Arrange
      const songId = 'nonexistent-song';
      songRepositoryStub.findSongById.resolves(null);
      
      // Act
      const result = await songService.getSongById(songId);
      
      // Assert
      expect(result).to.be.null;
    });
  });

  describe('getSongsByArtistId', function() {
    it('should return songs by artist ID', async function() {
      // Arrange
      const artistId = new ObjectId();
      const expectedSongs = [
        { _id: new ObjectId(), songName: 'Song 1', artistId },
        { _id: new ObjectId(), songName: 'Song 2', artistId }
      ];
      
      songRepositoryStub.findSongsByArtistId.resolves(expectedSongs);
      
      // Act
      const result = await songService.getSongsByArtistId(artistId.toString());
      
      // Assert
      expect(songRepositoryStub.findSongsByArtistId).to.have.been.calledWith(artistId.toString());
      expect(result).to.deep.equal(expectedSongs);
    });
    
    it('should return empty array when no songs found', async function() {
      // Arrange
      const artistId = new ObjectId().toString();
      songRepositoryStub.findSongsByArtistId.resolves([]);
      
      // Act
      const result = await songService.getSongsByArtistId(artistId);
      
      // Assert
      expect(result).to.be.an('array').that.is.empty;
    });
  });

  describe('getSongsBySongId', function() {
    it('should return songs by song ID', async function() {
      // Arrange
      const songId = 'test-song';
      const expectedSongs = [
        { _id: new ObjectId(), songId, songName: 'Test Song' }
      ];
      
      songRepositoryStub.findSongsBySongId.resolves(expectedSongs);
      
      // Act
      const result = await songService.getSongsBySongId(songId);
      
      // Assert
      expect(songRepositoryStub.findSongsBySongId).to.have.been.calledWith(songId);
      expect(result).to.deep.equal(expectedSongs);
    });
  });

  describe('updateSong', function() {
    it('should update a song by its ID', async function() {
      // Arrange
      const songId = 'test-song';
      const updateData = { songName: 'Updated Song Name' };
      const updatedSong = {
        _id: new ObjectId(),
        songId,
        songName: 'Updated Song Name',
        artistId: new ObjectId()
      };
      
      songRepositoryStub.modifySong.resolves(updatedSong);
      
      // Act
      const result = await songService.updateSong(songId, updateData);
      
      // Assert
      expect(songRepositoryStub.modifySong).to.have.been.calledWith(songId, updateData);
      expect(result).to.deep.equal(updatedSong);
    });
    
    it('should handle update failures', async function() {
      // Arrange
      const songId = 'nonexistent-song';
      const updateData = { songName: 'Updated Song Name' };
      songRepositoryStub.modifySong.resolves(null);
      
      // Act
      const result = await songService.updateSong(songId, updateData);
      
      // Assert
      expect(result).to.be.null;
    });
  });

  describe('deleteSong', function() {
    it('should delete a song and its associated data', async function() {
      // Arrange
      const songId = 'test-song';
      const songObjectId = new ObjectId();
      const artistId = new ObjectId();
      const song = {
        _id: songObjectId,
        songId,
        artistId,
        songName: 'Test Song'
      };
      
      songRepositoryStub.findSongById.resolves(song);
      songRepositoryStub.removeSongFromArtist.resolves({ _id: artistId, songs: [] });
      songRepositoryStub.deleteRoyalty.resolves({ acknowledged: true, deletedCount: 1 });
      songRepositoryStub.removeSong.resolves(song);
      
      // Act
      const result = await songService.deleteSong(songId);
      
      // Assert
      expect(songRepositoryStub.findSongById).to.have.been.calledWith(songId);
      expect(songRepositoryStub.removeSongFromArtist).to.have.been.calledWith(artistId, songObjectId);
      expect(songRepositoryStub.deleteRoyalty).to.have.been.calledWith(songObjectId);
      expect(songRepositoryStub.removeSong).to.have.been.calledWith(songId);
      expect(result).to.deep.equal(song);
    });

    it('should throw an error if song is not found', async function() {
      // Arrange
      const songId = 'nonexistent-song';
      songRepositoryStub.findSongById.resolves(null);
      
      // Act & Assert
      await expect(songService.deleteSong(songId)).to.be.rejectedWith('Song not found');
    });
    
    it('should handle errors during deletion process', async function() {
      // Arrange
      const songId = 'test-song';
      const songObjectId = new ObjectId();
      const artistId = new ObjectId();
      const song = {
        _id: songObjectId,
        songId,
        artistId,
        songName: 'Test Song'
      };
      
      songRepositoryStub.findSongById.resolves(song);
      // Simulate an error in one of the deletion steps
      songRepositoryStub.removeSongFromArtist.rejects(new Error('Database connection error'));
      
      // Act & Assert
      await expect(songService.deleteSong(songId)).to.be.rejectedWith('Database connection error');
    });
  });
});