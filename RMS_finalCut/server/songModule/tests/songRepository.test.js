const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
// const chaiAsPromised = require('chai-as-promised');
const mongoose = require('mongoose');
const { expect } = chai;

chai.use(sinonChai);
// chai.use(chaiAsPromised);
before(async () => {
    const chaiAsPromised = await import('chai-as-promised');
    chai.use(chaiAsPromised.default);
  });


const SongRepository = require('../repositories/songRepository');
const Song = require('../models/songModel');
const Artist = require('../models/artistModel');
const Royalty = require('../models/royaltyModel');

describe('SongRepository', () => {
  let songRepository;
  let songStub;
  let artistStub;
  let royaltyStub;

  beforeEach(() => {
    songRepository = new SongRepository();
    
    // Stubs for Song model
    songStub = {
      create: sinon.stub(Song, 'create'),
      findOne: sinon.stub(Song, 'findOne'),
      find: sinon.stub(Song, 'find'),
      findOneAndUpdate: sinon.stub(Song, 'findOneAndUpdate'),
      findOneAndDelete: sinon.stub(Song, 'findOneAndDelete')
    };
    
    // Stubs for Artist model
    artistStub = {
      findByIdAndUpdate: sinon.stub(Artist, 'findByIdAndUpdate')
    };
    
    // Stubs for Royalty model
    royaltyStub = {
      create: sinon.stub(Royalty, 'create'),
      deleteOne: sinon.stub(Royalty, 'deleteOne')
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('createSong', () => {
    it('should create a new song', async () => {
      const songData = {
        artistId: 'artist-id',
        songName: 'Test Song',
        artistName: 'Test Artist'
      };
      const expectedSong = { ...songData, _id: 'song-id' };
      
      songStub.create.resolves(expectedSong);
      
      const result = await songRepository.createSong(songData);
      
      expect(songStub.create).to.have.been.calledWith(songData);
      expect(result).to.deep.equal(expectedSong);
    });
  });

  describe('findSongById', () => {
    it('should find a song by songId', async () => {
      const songId = 'test-song';
      const expectedSong = {
        _id: 'song-object-id',
        artistId: 'artist-id',
        songId: 'test-song',
        songName: 'Test Song'
      };
      
      songStub.findOne.resolves(expectedSong);
      
      const result = await songRepository.findSongById(songId);
      
      expect(songStub.findOne).to.have.been.calledWith({ songId });
      expect(result).to.deep.equal(expectedSong);
    });
  });

  describe('findSongsByArtistId', () => {
    it('should find songs by artistId', async () => {
      const artistId = 'artist-id';
      const expectedSongs = [
        { _id: 'song-id-1', songName: 'Song 1', artistId },
        { _id: 'song-id-2', songName: 'Song 2', artistId }
      ];
      
      songStub.find.resolves(expectedSongs);
      
      const result = await songRepository.findSongsByArtistId(artistId);
      
      expect(songStub.find).to.have.been.calledWith({ artistId });
      expect(result).to.deep.equal(expectedSongs);
    });
  });

  describe('findSongsBySongId', () => {
    it('should find songs by songId', async () => {
      const songId = 'test-song';
      const expectedSongs = [
        { _id: 'song-object-id', songId, songName: 'Test Song' }
      ];
      
      songStub.find.resolves(expectedSongs);
      
      const result = await songRepository.findSongsBySongId(songId);
      
      expect(songStub.find).to.have.been.calledWith({ songId });
      expect(result).to.deep.equal(expectedSongs);
    });
  });

  describe('modifySong', () => {
    it('should update a song by songId', async () => {
      const songId = 'test-song';
      const updateData = { songName: 'Updated Song Name' };
      const expectedSong = {
        _id: 'song-object-id',
        songId,
        songName: 'Updated Song Name',
        artistId: 'artist-id'
      };
      
      songStub.findOneAndUpdate.resolves(expectedSong);
      
      const result = await songRepository.modifySong(songId, updateData);
      
      expect(songStub.findOneAndUpdate).to.have.been.calledWith(
        { songId },
        updateData,
        { new: true }
      );
      expect(result).to.deep.equal(expectedSong);
    });
  });

  describe('removeSong', () => {
    it('should remove a song by songId', async () => {
      const songId = 'test-song';
      const deletedSong = {
        _id: 'song-object-id',
        songId,
        songName: 'Test Song',
        artistId: 'artist-id'
      };
      
      songStub.findOneAndDelete.resolves(deletedSong);
      
      const result = await songRepository.removeSong(songId);
      
      expect(songStub.findOneAndDelete).to.have.been.calledWith({ songId });
      expect(result).to.deep.equal(deletedSong);
    });
  });

  describe('addSongToArtist', () => {
    it('should add song reference to artist', async () => {
      const artistId = 'artist-id';
      const songId = new mongoose.Types.ObjectId('507f1f77bcf86cd799439011');
      const updatedArtist = {
        _id: artistId,
        artistName: 'Test Artist',
        songs: [songId]
      };
      
      artistStub.findByIdAndUpdate.resolves(updatedArtist);
      
      const result = await songRepository.addSongToArtist(artistId, songId);
      
      expect(artistStub.findByIdAndUpdate).to.have.been.calledWith(
        artistId,
        { $addToSet: { songs: songId } },
        { new: true }
      );
      expect(result).to.deep.equal(updatedArtist);
    });
  });

  describe('removeSongFromArtist', () => {
    it('should remove song reference from artist', async () => {
      const artistId = 'artist-id';
      const songId = new mongoose.Types.ObjectId('507f1f77bcf86cd799439011');
      const updatedArtist = {
        _id: artistId,
        artistName: 'Test Artist',
        songs: []
      };
      
      artistStub.findByIdAndUpdate.resolves(updatedArtist);
      
      const result = await songRepository.removeSongFromArtist(artistId, songId);
      
      expect(artistStub.findByIdAndUpdate).to.have.been.calledWith(
        artistId,
        { $pull: { songs: songId } },
        { new: true }
      );
      expect(result).to.deep.equal(updatedArtist);
    });
  });

  describe('createRoyalty', () => {
    it('should create a new royalty record', async () => {
      const royaltyData = {
        royaltyId: 'test-artist-test-song',
        artistId: 'artist-id',
        songId: 'song-id'
      };
      const expectedRoyalty = { ...royaltyData, _id: 'royalty-id' };
      
      royaltyStub.create.resolves(expectedRoyalty);
      
      const result = await songRepository.createRoyalty(royaltyData);
      
      expect(royaltyStub.create).to.have.been.calledWith(royaltyData);
      expect(result).to.deep.equal(expectedRoyalty);
    });
  });

  describe('deleteRoyalty', () => {
    it('should delete royalty record by songId', async () => {
      const songId = 'song-id';
      const deleteResult = { acknowledged: true, deletedCount: 1 };
      
      royaltyStub.deleteOne.resolves(deleteResult);
      
      const result = await songRepository.deleteRoyalty(songId);
      
      expect(royaltyStub.deleteOne).to.have.been.calledWith({ songId });
      expect(result).to.deep.equal(deleteResult);
    });
  });
});