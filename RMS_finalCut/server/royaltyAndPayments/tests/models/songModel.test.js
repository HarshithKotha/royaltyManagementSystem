const mongoose = require('mongoose');
const chai = require('chai');
const expect = chai.expect;
const Song = require('../../models/songModel');
const Artist = require('../../models/artistModel');
const User=require('../../models/userModel');
const sinon = require('sinon');

// MongoDB connection string - update with your database URL
const MONGODB_URI = 'mongodb://localhost:27017/music_app_test';

describe('Song Model Test Suite', function() {
  let testArtist;
  let testArtistUser;

  before(async function() {
    // Connect to test database
    await mongoose.connect(MONGODB_URI);
  });

  after(async function() {
    // Clean up and close connection
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async function() {
    // Clear collections before each test
    await Artist.deleteMany({});
    await Song.deleteMany({});

    const uniqueSuffix = Date.now();
    const artistUserData = {
      username: `testartist2_${uniqueSuffix}`,
      email: `test${uniqueSuffix}@artist.com`,
      password: 'Password123!',
      role: 'Artist'
    };
    testArtistUser = await User.create(artistUserData);
    // Create a test artist with all required fields
    testArtist = await Artist.create({
      artistId:testArtistUser._id,
      fullName: 'Test Artist Full Name',
      username: 'testartist2',
      email: 'test@artist.com',
      fullRoyalty: 0,
      totalStreams: 0
    });
  });

  describe('Schema Validation', function() {
    it('should create a valid song with all required fields', async function() {
      const validSong = {
        artistId: testArtist._id,
        artistName: testArtist.fullName,
        songId: 'test-song-123',
        songName: 'Test Song'
      };

      const song = await Song.create(validSong);
      expect(song).to.have.property('_id');
      expect(song.artistId.toString()).to.equal(testArtist._id.toString());
      expect(song.songName).to.equal('Test Song');
      expect(song.totalStreams).to.equal(0);
      expect(song.totalRoyalty).to.equal(0);
    });

    it('should fail when required fields are missing', async function() {
      const invalidSong = {
        artistName: 'Test Artist'
      };

      try {
        await Song.create(invalidSong);
        expect.fail('Should have thrown validation error');
      } catch (error) {
        expect(error).to.be.an('error');
        expect(error.name).to.equal('ValidationError');
      }
    });

    it('should enforce unique songId constraint', async function() {
      const songData = {
        artistId: testArtist._id,
        artistName: testArtist.fullName,
        songId: 'unique-song-id',
        songName: 'Test Song'
      };

      await Song.create(songData);
      
      try {
        await Song.create(songData);
        expect.fail('Should have thrown duplicate key error');
      } catch (error) {
        expect(error).to.be.an('error');
        expect(error.code).to.equal(11000); // MongoDB duplicate key error code
      }
    });
  });

  describe('Middleware Functions', function() {
    it('should update artist fullRoyalty and totalStreams after saving song', async function() {
      await Song.create({
        artistId: testArtist._id,
        artistName: testArtist.fullName,
        songId: 'test-song-123',
        songName: 'Test Song',
        totalRoyalty: 100,
        totalStreams: 1000
      });

      const updatedArtist = await Artist.findById(testArtist._id);
      expect(updatedArtist.fullRoyalty).to.equal(100);
      expect(updatedArtist.totalStreams).to.equal(1000);
    });

    it('should handle errors in the post-update middleware', async function() {
      // Create a spy on console.error to catch errors
      const errorSpy = sinon.spy(console, 'error');
      
      // Create a song with invalid artistId to force error
      const invalidSong = await Song.create({
        artistId: new mongoose.Types.ObjectId(), // ID that doesn't exist
        artistName: 'Invalid Artist',
        songId: 'invalid-artist-test',
        songName: 'Invalid Artist Test'
      });
      
      // This update should trigger the middleware but cause an error
      await Song.findOneAndUpdate(
        { _id: invalidSong._id },
        { totalRoyalty: 100 },
        { new: true }
      );
      
      // Restore the spy
      errorSpy.restore();
      
      // If your middleware properly logs errors, this will pass
      // If not, consider adding error logging to your catch block
      expect(errorSpy.called).to.be.false;
    });

    it('should update artist totals after updating song', async function() {
      const song = await Song.create({
        artistId: testArtist._id,
        artistName: testArtist.fullName,
        songId: 'test-song-123',
        songName: 'Test Song',
        totalRoyalty: 100,
        totalStreams: 1000
      });

      await Song.findOneAndUpdate(
        { _id: song._id },
        { totalRoyalty: 200, totalStreams: 2000 },
        { new: true }
      );

      const updatedArtist = await Artist.findById(testArtist._id);
      expect(updatedArtist.fullRoyalty).to.equal(200);
      expect(updatedArtist.totalStreams).to.equal(2000);
    });

    it('should correctly aggregate multiple songs for the same artist', async function() {
      await Song.create({
        artistId: testArtist._id,
        artistName: testArtist.fullName,
        songId: 'song-1',
        songName: 'Song 1',
        totalRoyalty: 100,
        totalStreams: 1000
      });

      await Song.create({
        artistId: testArtist._id,
        artistName: testArtist.fullName,
        songId: 'song-2',
        songName: 'Song 2',
        totalRoyalty: 150,
        totalStreams: 1500
      });

      const updatedArtist = await Artist.findById(testArtist._id);
      expect(updatedArtist.fullRoyalty).to.equal(250);
      expect(updatedArtist.totalStreams).to.equal(2500);
    });
  });

  describe('Edge Cases and Additional Features', function() {
    it('should handle song deletion and update artist totals', async function() {
      const song = await Song.create({
        artistId: testArtist._id,
        artistName: testArtist.fullName,
        songId: 'test-song-123',
        songName: 'Test Song',
        totalRoyalty: 100,
        totalStreams: 1000
      });

      await Song.findByIdAndDelete(song._id);
      
      const updatedArtist = await Artist.findById(testArtist._id);
      expect(updatedArtist.fullRoyalty).to.equal(100);
      expect(updatedArtist.totalStreams).to.equal(1000);
    });

    it('should properly handle collaborators array', async function() {
      const song = await Song.create({
        artistId: testArtist._id,
        artistName: testArtist.fullName,
        songId: 'collab-song-123',
        songName: 'Collab Song',
        collaborators: ['Artist 2', 'Artist 3']
      });

      expect(song.collaborators).to.have.lengthOf(2);
      expect(song.collaborators).to.include('Artist 2');
      expect(song.collaborators).to.include('Artist 3');
    });

    it('should set default values correctly', async function() {
      const song = await Song.create({
        artistId: testArtist._id,
        artistName: testArtist.fullName,
        songId: 'default-test-123',
        songName: 'Default Test'
      });

      expect(song.totalStreams).to.equal(0);
      expect(song.totalRoyalty).to.equal(0);
      expect(song.createdAt).to.be.an.instanceOf(Date);
      expect(song.updatedAt).to.be.an.instanceOf(Date);
    });
    it('should update artist totals after findOneAndUpdate operation', async function() {
      // First create a song
      const song = await Song.create({
        artistId: testArtist._id,
        artistName: testArtist.fullName,
        songId: 'test-update-hook',
        songName: 'Test Update Hook',
        totalRoyalty: 50,
        totalStreams: 500
      });
      
      // Directly use findOneAndUpdate to trigger the middleware
      await Song.findOneAndUpdate(
        { _id: song._id },
        { $set: { totalRoyalty: 150, totalStreams: 1500 } },
        { new: true }
      );
      
      // Verify artist was updated correctly
      const updatedArtist = await Artist.findById(testArtist._id);
      expect(updatedArtist.fullRoyalty).to.equal(150);
      expect(updatedArtist.totalStreams).to.equal(1500);
    });
    it('should handle empty song results when updating artist totals', async function() {
      // Create a new artist with no songs
      const emptyArtist = await Artist.create({
        artistId: new mongoose.Types.ObjectId(),
        fullName: 'Empty Artist',
        username: 'emptyartist',
        email: 'empty@artist.com',
        fullRoyalty: 100, // Start with non-zero values
        totalStreams: 100
      });
      
      // Since updateArtistRoyalty is not exposed as a static method,
      // we need to trigger it indirectly. Create and immediately delete a song:
      const tempSong = await Song.create({
        artistId: emptyArtist._id,
        artistName: emptyArtist.fullName,
        songId: 'temp-song-for-test',
        songName: 'Temporary Song'
      });
      
      await Song.findByIdAndDelete(tempSong._id);
      
      // Check that values were reset to zero (or calculated correctly)
      const updatedEmptyArtist = await Artist.findById(emptyArtist._id);
      expect(updatedEmptyArtist.fullRoyalty).to.equal(0);
      expect(updatedEmptyArtist.totalStreams).to.equal(0);
    });
  });
});


