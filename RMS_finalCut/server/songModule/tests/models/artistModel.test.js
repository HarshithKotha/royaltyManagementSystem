const mongoose = require('mongoose');
const { expect } = require('chai');
const sinon = require('sinon');
const Artist = require('../../models/artistModel');
const Song = require('../../models/songModel');

describe('Artist Model Tests', function() {
  let userId, songId, managerId;
  
  before(async function() {
    await mongoose.connect('mongodb://localhost:27017/artist_test_db', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    // Create ObjectIds for testing
    userId = new mongoose.Types.ObjectId();
    songId = new mongoose.Types.ObjectId();
    managerId = new mongoose.Types.ObjectId();
  });

  beforeEach(async function() {
    await mongoose.connection.dropDatabase();
    sinon.restore();
  });

  after(async function() {
    await mongoose.connection.close();
  });

  it('should create a valid artist with required fields', async function() {
    const artistData = {
      artistId: userId,
      username: 'johnsmith',
      fullName: 'John Smith',
      email: 'john@example.com',
      mobileNo: '1234567890',
      address: '123 Music Street',
      description: 'Professional singer-songwriter',
      songs: [songId],
      manager: managerId
    };
    
    const artist = new Artist(artistData);
    const savedArtist = await artist.save();
    
    expect(savedArtist).to.have.property('_id');
    expect(savedArtist.artistId.toString()).to.equal(userId.toString());
    expect(savedArtist.username).to.equal('johnsmith');
    expect(savedArtist.fullName).to.equal('John Smith');
    expect(savedArtist.email).to.equal('john@example.com');
    expect(savedArtist.songs[0].toString()).to.equal(songId.toString());
    expect(savedArtist.manager.toString()).to.equal(managerId.toString());
    expect(savedArtist.createdAt).to.be.instanceOf(Date);
    expect(savedArtist.updatedAt).to.be.instanceOf(Date);
  });

  it('should validate required fields', async function() {
    const artist = new Artist({});
    
    try {
      await artist.validate();
      throw new Error('Validation should have failed');
    } catch (error) {
      expect(error.errors.artistId).to.exist;
      expect(error.errors.username).to.exist;
      expect(error.errors.fullName).to.exist;
      expect(error.errors.email).to.exist;
    }
  });

  it('should set default values correctly', async function() {
    const artist = new Artist({
      artistId: userId,
      username: 'testartist',
      fullName: 'Test Artist',
      email: 'test@example.com'
    });
    
    const savedArtist = await artist.save();
    expect(savedArtist.artistShare).to.equal(0);
    expect(savedArtist.totalStreams).to.equal(0);
    expect(savedArtist.fullRoyalty).to.equal(0);
    expect(savedArtist.totalRoyaltyDue).to.equal(0);
    expect(savedArtist.totalRoyaltyPaid).to.equal(0);
    expect(savedArtist.songs).to.be.an('array').that.is.empty;
  });

  it('should enforce unique email', async function() {
    // First, ensure the index is created
    await mongoose.connection.collections.Artist.createIndex({ email: 1 }, { unique: true });
  
    // Create first artist
    await new Artist({
      artistId: userId,
      username: 'artist1',
      fullName: 'Artist One',
      email: 'unique@example.com'
    }).save();
      
    // Try to create a second artist with the same email
    const duplicateArtist = new Artist({
      artistId: new mongoose.Types.ObjectId(),
      username: 'artist2',
      fullName: 'Artist Two',
      email: 'unique@example.com'
    });
      
    let error;
    try {
      await duplicateArtist.save();
    } catch (err) {
      error = err;
    }
  
    expect(error).to.have.property('code', 11000);
  });

  it('should update artist details successfully', async function() {
    const artist = await new Artist({
      artistId: userId,
      username: 'originalname',
      fullName: 'Original Name',
      email: 'original@example.com'
    }).save();
    
    artist.username = 'updatedname';
    artist.fullName = 'Updated Name';
    artist.mobileNo = '9876543210';
    
    const updatedArtist = await artist.save();
    
    expect(updatedArtist.username).to.equal('updatedname');
    expect(updatedArtist.fullName).to.equal('Updated Name');
    expect(updatedArtist.mobileNo).to.equal('9876543210');
    expect(updatedArtist.updatedAt).to.be.instanceOf(Date);
  });

  it('should update royalty and stream counts correctly', async function() {
    const artist = await new Artist({
      artistId: userId,
      username: 'royaltytest',
      fullName: 'Royalty Test',
      email: 'royalty@example.com'
    }).save();
    
    artist.totalStreams = 1000;
    artist.fullRoyalty = 500;
    artist.totalRoyaltyDue = 300;
    artist.totalRoyaltyPaid = 200;
    
    const updatedArtist = await artist.save();
    
    expect(updatedArtist.totalStreams).to.equal(1000);
    expect(updatedArtist.fullRoyalty).to.equal(500);
    expect(updatedArtist.totalRoyaltyDue).to.equal(300);
    expect(updatedArtist.totalRoyaltyPaid).to.equal(200);
  });

  it('should add and remove songs from the songs array', async function() {
    const artist = await new Artist({
      artistId: userId,
      username: 'songtest',
      fullName: 'Song Test',
      email: 'song@example.com'
    }).save();
    
    const newSongId = new mongoose.Types.ObjectId();
    artist.songs.push(newSongId);
    
    let updatedArtist = await artist.save();
    expect(updatedArtist.songs).to.have.lengthOf(1);
    expect(updatedArtist.songs[0].toString()).to.equal(newSongId.toString());
    
    updatedArtist.songs = updatedArtist.songs.filter(id => id.toString() !== newSongId.toString());
    updatedArtist = await updatedArtist.save();
    
    expect(updatedArtist.songs).to.have.lengthOf(0);
  });

  it('should update artist share percentage', async function() {
    const artist = await new Artist({
      artistId: userId,
      username: 'sharetest',
      fullName: 'Share Test',
      email: 'share@example.com',
      artistShare: 0
    }).save();
    
    artist.artistShare = 75;
    const updatedArtist = await artist.save();
    
    expect(updatedArtist.artistShare).to.equal(75);
  });

  it('should handle null optional fields', async function() {
    const artist = await new Artist({
      artistId: userId,
      username: 'nulltest',
      fullName: 'Null Test',
      email: 'null@example.com'
    }).save();
    
    expect(artist.mobileNo).to.be.undefined;
    expect(artist.address).to.be.undefined;
    expect(artist.description).to.be.undefined;
    expect(artist.manager).to.be.undefined;
  });
});