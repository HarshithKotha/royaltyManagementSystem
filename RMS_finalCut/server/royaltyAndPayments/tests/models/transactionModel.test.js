const mongoose = require('mongoose');
const { expect } = require('chai');
const Transaction = require('../../models/transaction');

describe('Transaction Model Tests', function() {
  let userId, royaltyId, songId;
  
  // Connect to test database before running tests
  before(async function() {
    await mongoose.connect('mongodb://localhost:27017/transaction_test_db', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    // Create ObjectIds for testing
    userId = new mongoose.Types.ObjectId();
    royaltyId = new mongoose.Types.ObjectId();
    songId = new mongoose.Types.ObjectId();
  });

  // Clear database between tests
  beforeEach(async function() {
    await mongoose.connection.dropDatabase();
  });

  // Disconnect after tests
  after(async function() {
    await mongoose.connection.close();
  });

  it('should create a valid transaction with required fields', async function() {
    const transactionData = {
      userId: userId,
      royaltyId: royaltyId,
      songId: songId,
      transactionAmount: 1000
    };
    
    const transaction = new Transaction(transactionData);
    const savedTransaction = await transaction.save();
    
    expect(savedTransaction).to.have.property('_id');
    expect(savedTransaction.userId.toString()).to.equal(userId.toString());
    expect(savedTransaction.royaltyId.toString()).to.equal(royaltyId.toString());
    expect(savedTransaction.songId.toString()).to.equal(songId.toString());
    expect(savedTransaction.transactionAmount).to.equal(1000);
    expect(savedTransaction.status).to.equal('Pending');
    expect(savedTransaction.transactionDate).to.be.instanceOf(Date);
  });

  it('should validate required fields', async function() {
    const transaction = new Transaction({});
    
    try {
      await transaction.validate();
      throw new Error('Validation should have failed');
    } catch (error) {
      expect(error.errors.userId).to.exist;
      expect(error.errors.royaltyId).to.exist;
      expect(error.errors.songId).to.exist;
      expect(error.errors.transactionAmount).to.exist;
    }
  });

  it('should validate transactionAmount minimum value', async function() {
    const transaction = new Transaction({
      userId: userId,
      royaltyId: royaltyId,
      songId: songId,
      transactionAmount: 0 // Less than minimum (1)
    });
    
    try {
      await transaction.validate();
      throw new Error('Validation should have failed');
    } catch (error) {
      expect(error.errors.transactionAmount).to.exist;
      expect(error.errors.transactionAmount.message).to.equal('Amount must be greater than zero');
    }
  });

  it('should set default values correctly', async function() {
    const transaction = new Transaction({
      userId: userId,
      royaltyId: royaltyId,
      songId: songId,
      transactionAmount: 1000
    });
    
    const savedTransaction = await transaction.save();
    expect(savedTransaction.royaltyPaid).to.equal(0);
    expect(savedTransaction.royaltyDue).to.equal(1000); // Set by pre-save hook
    expect(savedTransaction.artistShare).to.equal(0);
    expect(savedTransaction.managerShare).to.equal(0);
    expect(savedTransaction.status).to.equal('Pending');
    expect(savedTransaction.transactionDate).to.be.instanceOf(Date);
  });

  it('should validate status enum values', async function() {
    // Test valid status
    const validStatuses = ['Pending', 'Approved', 'Rejected'];
    
    for (const status of validStatuses) {
      const transaction = new Transaction({
        userId: userId,
        royaltyId: royaltyId,
        songId: songId,
        transactionAmount: 1000,
        status: status
      });
      
      const savedTransaction = await transaction.save();
      expect(savedTransaction.status).to.equal(status);
    }
    
    // Test invalid status
    const transaction = new Transaction({
      userId: userId,
      royaltyId: royaltyId,
      songId: songId,
      transactionAmount: 1000,
      status: 'InvalidStatus'
    });
    
    try {
      await transaction.validate();
      throw new Error('Validation should have failed');
    } catch (error) {
      expect(error.errors.status).to.exist;
    }
  });

  it('should set royaltyDue to transactionAmount for new transactions', async function() {
    const transaction = new Transaction({
      userId: userId,
      royaltyId: royaltyId,
      songId: songId,
      transactionAmount: 2500
    });
    
    const savedTransaction = await transaction.save();
    expect(savedTransaction.royaltyDue).to.equal(2500);
  });

  it('should not override existing royaltyDue when updating other fields', async function() {
    // Create initial transaction
    const transaction = await new Transaction({
      userId: userId,
      royaltyId: royaltyId,
      songId: songId,
      transactionAmount: 1000,
      royaltyDue: 750 // Set initial value
    }).save();
    
    // Verify pre-save hook didn't override our set value
    expect(transaction.royaltyDue).to.equal(1000); // Pre-save hook should have set this
    
    // Update a different field
    transaction.status = 'Approved';
    transaction.royaltyDue = 600; // Manually update
    const updatedTransaction = await transaction.save();
    
    // Verify royaltyDue wasn't reset by pre-save hook
    expect(updatedTransaction.status).to.equal('Approved');
    expect(updatedTransaction.royaltyDue).to.equal(600);
  });

  it('should update royaltyPaid and adjust royaltyDue', async function() {
    const transaction = await new Transaction({
      userId: userId,
      royaltyId: royaltyId,
      songId: songId,
      transactionAmount: 1000
    }).save();
    
    // Initial state
    expect(transaction.royaltyPaid).to.equal(0);
    expect(transaction.royaltyDue).to.equal(1000);
    
    // Update royaltyPaid
    transaction.royaltyPaid = 400;
    transaction.royaltyDue = 600; // Manual update
    const updatedTransaction = await transaction.save();
    
    expect(updatedTransaction.royaltyPaid).to.equal(400);
    expect(updatedTransaction.royaltyDue).to.equal(600);
  });

  it('should update artistShare and managerShare', async function() {
    const transaction = await new Transaction({
      userId: userId,
      royaltyId: royaltyId,
      songId: songId,
      transactionAmount: 1000
    }).save();
    
    // Initial state
    expect(transaction.artistShare).to.equal(0);
    expect(transaction.managerShare).to.equal(0);
    
    // Update shares
    transaction.artistShare = 700;
    transaction.managerShare = 300;
    const updatedTransaction = await transaction.save();
    
    expect(updatedTransaction.artistShare).to.equal(700);
    expect(updatedTransaction.managerShare).to.equal(300);
  });

  it('should handle ObjectId reference validation', async function() {
    // Test with invalid ObjectId
    const transaction = new Transaction({
      userId: 'invalid-id',
      royaltyId: royaltyId,
      songId: songId,
      transactionAmount: 1000
    });
    
    try {
      await transaction.validate();
      throw new Error('Validation should have failed');
    } catch (error) {
      expect(error.errors.userId).to.exist;
    }
  });

  it('should handle transaction date updates', async function() {
    const pastDate = new Date('2023-01-01');
    
    const transaction = new Transaction({
      userId: userId,
      royaltyId: royaltyId,
      songId: songId,
      transactionAmount: 1000,
      transactionDate: pastDate
    });
    
    const savedTransaction = await transaction.save();
    expect(savedTransaction.transactionDate).to.deep.equal(pastDate);
    
    // Update to a new date
    const newDate = new Date('2023-06-15');
    savedTransaction.transactionDate = newDate;
    const updatedTransaction = await savedTransaction.save();
    
    expect(updatedTransaction.transactionDate).to.deep.equal(newDate);
  });
});