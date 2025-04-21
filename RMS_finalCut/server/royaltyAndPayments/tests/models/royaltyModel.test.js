const mongoose = require('mongoose');
const { expect } = require('chai');
const sinon = require('sinon');
const Royalty = require('../../models/royaltyModel');
const Song = require('../../models/songModel');

describe('Royalty Model Tests', function() {
  let songId, artistId;
  
  // Connect to test database before running tests
  before(async function() {
    await mongoose.connect('mongodb://localhost:27017/royalty_test_db', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    // Create ObjectIds for testing
    songId = new mongoose.Types.ObjectId();
    artistId = new mongoose.Types.ObjectId();
  });

  // Clear database between tests
  beforeEach(async function() {
    await mongoose.connection.dropDatabase();
    sinon.restore(); // Reset all stubs
  });

  // Disconnect after tests
  after(async function() {
    await mongoose.connection.close();
  });

  it('should create a valid royalty with required fields', async function() {
    const royaltyData = {
      royaltyId: 'venu-krithik',
      artistId: artistId,
      songId: songId,
      period: 'January 2025',
      totalRoyalty: 1000,
      totalStreams: 5000
    };
    
    const royalty = new Royalty(royaltyData);
    const savedRoyalty = await royalty.save();
    
    expect(savedRoyalty).to.have.property('_id');
    expect(savedRoyalty.royaltyId).to.equal('venu-krithik');
    expect(savedRoyalty.artistId.toString()).to.equal(artistId.toString());
    expect(savedRoyalty.songId.toString()).to.equal(songId.toString());
    expect(savedRoyalty.period).to.equal('January 2025');
    expect(savedRoyalty.totalRoyalty).to.equal(1000);
    expect(savedRoyalty.totalStreams).to.equal(5000);
    expect(savedRoyalty.calculated_date).to.be.instanceOf(Date);
  });

  it('should validate required fields', async function() {
    const royalty = new Royalty({});
    
    try {
      await royalty.validate();
      throw new Error('Validation should have failed');
    } catch (error) {
      expect(error.errors.royaltyId).to.exist;
      expect(error.errors.artistId).to.exist;
      expect(error.errors.songId).to.exist;
    }
  });

  it('should set default values correctly', async function() {
    const royalty = new Royalty({
      royaltyId: 'test-artist',
      artistId: artistId,
      songId: songId
    });
    
    const savedRoyalty = await royalty.save();
    expect(savedRoyalty.totalRoyalty).to.equal(0);
    expect(savedRoyalty.royaltyDue).to.equal(0);
    expect(savedRoyalty.royaltyPaid).to.equal(0);
    expect(savedRoyalty.totalStreams).to.equal(0);
    expect(savedRoyalty.calculated_date).to.be.instanceOf(Date);
    expect(savedRoyalty.period).to.be.a('string');
  });

  it('should enforce unique royaltyId', async function() {
    // First, ensure the index is created
    await mongoose.connection.collections.Royalty.createIndex({ royaltyId: 1 }, { unique: true });
  
    // Create first royalty
    await new Royalty({
      royaltyId: 'unique-id',
      artistId: artistId,
      songId: songId
    }).save();
      
    // Try to create a second royalty with the same ID
    const duplicateRoyalty = new Royalty({
      royaltyId: 'unique-id',
      artistId: new mongoose.Types.ObjectId(),
      songId: new mongoose.Types.ObjectId()
    });
      
    let error;
    try {
      await duplicateRoyalty.save();
    } catch (err) {
      error = err;
    }
  
    // If save succeeded when it should have failed
    if (!error) {
      throw new Error('Save operation should have failed due to duplicate royaltyId');
    }
  
    // Now check the error code
    expect(error).to.have.property('code', 11000);
  });

  it('should trigger pre-save middleware when totalRoyalty changes', async function() {
    // Stub the Song.updateMany method
    const updateManyStub = sinon.stub(Song, 'updateMany').resolves({ nModified: 1 });
    
    const royalty = new Royalty({
      royaltyId: 'test-royalty',
      artistId: artistId,
      songId: songId,
      totalRoyalty: 500,
      totalStreams: 2500
    });
    
    await royalty.save();
    
    // Check that updateMany was called with correct parameters
    expect(updateManyStub.calledOnce).to.be.true;
    expect(updateManyStub.firstCall.args[0]).to.deep.equal({ _id: songId });
    
    // Verify the parameters passed to updateMany
    const updateArg = updateManyStub.firstCall.args[1];
    expect(updateArg.$set).to.have.property('totalRoyalty', 500);
  });

  it('should not trigger pre-save middleware when totalRoyalty does not change', async function() {
    // Create initial royalty
    const royalty = await new Royalty({
      royaltyId: 'test-royalty-2',
      artistId: artistId,
      songId: songId,
      totalRoyalty: 1000,
      totalStreams: 5000
    }).save();
    
    // Stub the Song.updateMany method
    const updateManyStub = sinon.stub(Song, 'updateMany').resolves({ nModified: 1 });
    
    // Update a field other than totalRoyalty
    royalty.period = 'February 2025';
    await royalty.save();
    
    // Check that updateMany was not called
    expect(updateManyStub.called).to.be.false;
  });

  it('should update royaltyDue and royaltyPaid fields', async function() {
    const royalty = new Royalty({
      royaltyId: 'test-royalty-3',
      artistId: artistId,
      songId: songId,
      totalRoyalty: 1000
    });
    
    const savedRoyalty = await royalty.save();
    expect(savedRoyalty.royaltyDue).to.equal(0);
    expect(savedRoyalty.royaltyPaid).to.equal(0);
    
    savedRoyalty.royaltyDue = 500;
    savedRoyalty.royaltyPaid = 200;
    const updatedRoyalty = await savedRoyalty.save();
    
    expect(updatedRoyalty.royaltyDue).to.equal(500);
    expect(updatedRoyalty.royaltyPaid).to.equal(200);
  });

  it('should handle error in pre-save middleware', async function() {
    // Stub updateMany to throw an error
    sinon.stub(Song, 'updateMany').rejects(new Error('Database error'));
    
    const royalty = new Royalty({
      royaltyId: 'test-error-handling',
      artistId: artistId,
      songId: songId,
      totalRoyalty: 1000
    });
    
    // Should still save despite error in middleware
    const savedRoyalty = await royalty.save();
    expect(savedRoyalty).to.have.property('_id');
    expect(savedRoyalty.totalRoyalty).to.equal(1000);
  });

  it('should properly update totalStreams and sync with Song model', async function() {
    // Stub the Song.updateMany method
    const updateManyStub = sinon.stub(Song, 'updateMany').resolves({ nModified: 1 });
    
    const royalty = new Royalty({
      royaltyId: 'stream-test',
      artistId: artistId,
      songId: songId,
      totalStreams: 0,
      totalRoyalty: 0
    });
    
    // Save the initial royalty
    await royalty.save();
    
    // Reset the stub's history since the first save might have called it
    updateManyStub.resetHistory();
    
    // Now only update totalRoyalty which should trigger the middleware
    royalty.totalRoyalty = 2000;
    await royalty.save();
    
    // Check that updateMany was called with correct parameters
    expect(updateManyStub.calledOnce).to.be.true;
    const updateArg = updateManyStub.firstCall.args[1];
    expect(updateArg.$set).to.have.property('totalRoyalty', 2000);
});
});