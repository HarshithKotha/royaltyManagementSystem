// test/unit/repositories/transactionRepository.test.js
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
// const chaiAsPromised = require('chai-as-promised');
const { expect } = chai;
const mongoose = require('mongoose');
const Transaction = require('../models/transaction');
const Royalty = require('../models/royaltyModel');
const Artist = require('../models/artistModel');
const Manager = require('../models/managerModel');
const TransactionRepository = require('../repositories/transactionRepository');

chai.use(sinonChai);
// chai.use(chaiAsPromised);
before(async () => {
    const chaiAsPromised = await import('chai-as-promised');
    chai.use(chaiAsPromised.default);
  });

describe('Transaction Repository', () => {
  let transactionRepository;
  
  beforeEach(() => {
    transactionRepository = new TransactionRepository();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('findById', () => {
    it('should find transaction by id', async () => {
      const transactionId = 'trans123';
      const expectedTransaction = { _id: transactionId, amount: 100 };
      
      sinon.stub(Transaction, 'findById').resolves(expectedTransaction);

      const result = await transactionRepository.findById(transactionId);

      expect(result).to.deep.equal(expectedTransaction);
      expect(Transaction.findById).to.have.been.calledWith(transactionId);
    });
  });

  
  describe('findAllTransactions', () => {
    it('should find all transactions with populated fields', async () => {
      const expectedTransactions = [
        { _id: '1', userId: 'user1', amount: 100 },
        { _id: '2', userId: 'user2', amount: 200 }
      ];

      // Create the chain of stubs
      const execStub = sinon.stub().resolves(expectedTransactions);
      const secondPopulateStub = sinon.stub().returns({ exec: execStub });
      const firstPopulateStub = sinon.stub().returns({ populate: secondPopulateStub });

      // Set up the find stub
      sinon.stub(Transaction, 'find').returns({
        populate: firstPopulateStub
      });

      const result = await transactionRepository.findAllTransactions();

      // Verify the results
      expect(result).to.deep.equal(expectedTransactions);
      
      // Verify the chain was called correctly
      expect(Transaction.find).to.have.been.calledOnce;
      expect(firstPopulateStub).to.have.been.calledWith('userId');
      expect(secondPopulateStub).to.have.been.calledWith('royaltyId');
      expect(execStub).to.have.been.calledOnce;
    });
  });

  describe('findTransactionsByUserId', () => {
    it('should find transactions for artist role', async () => {
      const userId = 'artist123';
      const role = 'artist';
      const expectedTransactions = [
        { _id: '1', userId, amount: 100 },
        { _id: '2', userId, amount: 200 }
      ];

      // Create chain of stubs
      const execStub = sinon.stub().resolves(expectedTransactions);
      const managerPopulateStub = sinon.stub().returns({ exec: execStub });
      const userIdNestedPopulateStub = sinon.stub().returns({ exec: execStub });
      const userIdPopulateStub = sinon.stub().returns({ populate: managerPopulateStub });
      const songIdPopulateStub = sinon.stub().returns({ populate: userIdPopulateStub });
      const royaltyIdPopulateStub = sinon.stub().returns({ populate: songIdPopulateStub });

      // Set up the find stub
      sinon.stub(Transaction, 'find').returns({
        populate: royaltyIdPopulateStub
      });

      const result = await transactionRepository.findTransactionsByUserId(userId, role);

      expect(result).to.deep.equal(expectedTransactions);
      expect(Transaction.find).to.have.been.calledWith({ userId });
      expect(royaltyIdPopulateStub).to.have.been.calledWith('royaltyId');
      expect(songIdPopulateStub).to.have.been.calledWith('songId');
      expect(userIdPopulateStub).to.have.been.calledWith('userId');
      expect(managerPopulateStub).to.have.been.calledWith({
        path: 'userId',
        populate: { path: 'manager' }
      });
      expect(execStub).to.have.been.calledOnce;
    });



    it('should throw error for invalid role', async () => {
      const userId = 'user123';
      const role = 'invalid';

      await expect(transactionRepository.findTransactionsByUserId(userId, role))
        .to.be.rejectedWith('Invalid role');
    });
  });

  describe('createTransaction', () => {
    it('should create new transaction', async () => {
      const transactionData = {
        userId: 'user123',
        royaltyId: 'royalty123',
        transactionAmount: 100
      };
      const expectedTransaction = { ...transactionData, _id: 'trans123' };

      const saveStub = sinon.stub().resolves(expectedTransaction);
      sinon.stub(Transaction.prototype, 'save').get(() => saveStub);

      const result = await transactionRepository.createTransaction(transactionData);

      expect(result).to.deep.equal(expectedTransaction);
      expect(saveStub).to.have.been.called;
    });
  });

  describe('updateTransaction', () => {
    it('should update transaction', async () => {
      const transaction = {
        _id: 'trans123',
        amount: 100,
        save: sinon.stub().resolves({ _id: 'trans123', amount: 100, updated: true })
      };

      const result = await transactionRepository.updateTransaction(transaction);

      expect(result.updated).to.be.true;
      expect(transaction.save).to.have.been.called;
    });
  });

  describe('deleteTransaction', () => {
    it('should delete transaction', async () => {
      const transactionId = 'trans123';
      const expectedResult = { _id: transactionId, deleted: true };

      sinon.stub(Transaction, 'findByIdAndDelete').resolves(expectedResult);

      const result = await transactionRepository.deleteTransaction(transactionId);

      expect(result).to.deep.equal(expectedResult);
      expect(Transaction.findByIdAndDelete).to.have.been.calledWith(transactionId);
    });
  });

  describe('findRoyaltyById', () => {
    it('should find royalty by id', async () => {
      const royaltyId = 'royalty123';
      const expectedRoyalty = { _id: royaltyId, amount: 100 };

      sinon.stub(Royalty, 'findById').resolves(expectedRoyalty);

      const result = await transactionRepository.findRoyaltyById(royaltyId);

      expect(result).to.deep.equal(expectedRoyalty);
      expect(Royalty.findById).to.have.been.calledWith(royaltyId);
    });
  });

  describe('findArtistById', () => {
    it('should find artist by id', async () => {
      const artistId = 'artist123';
      const expectedArtist = { _id: artistId, name: 'Test Artist' };

      sinon.stub(Artist, 'findById').resolves(expectedArtist);

      const result = await transactionRepository.findArtistById(artistId);

      expect(result).to.deep.equal(expectedArtist);
      expect(Artist.findById).to.have.been.calledWith(artistId);
    });
  });

  describe('findManagerById', () => {
    it('should find manager by id', async () => {
      const managerId = 'manager123';
      const expectedManager = { _id: managerId, name: 'Test Manager' };

      sinon.stub(Manager, 'findById').resolves(expectedManager);

      const result = await transactionRepository.findManagerById(managerId);

      expect(result).to.deep.equal(expectedManager);
      expect(Manager.findById).to.have.been.calledWith(managerId);
    });
  });

  describe('updateRoyalty', () => {
    it('should update royalty', async () => {
      const royalty = {
        _id: 'royalty123',
        amount: 100,
        save: sinon.stub().resolves({ _id: 'royalty123', amount: 100, updated: true })
      };

      const result = await transactionRepository.updateRoyalty(royalty);

      expect(result.updated).to.be.true;
      expect(royalty.save).to.have.been.called;
    });
  });

  describe('updateArtist', () => {
    it('should update artist', async () => {
      const artist = {
        _id: 'artist123',
        name: 'Test Artist',
        save: sinon.stub().resolves({ _id: 'artist123', name: 'Test Artist', updated: true })
      };

      const result = await transactionRepository.updateArtist(artist);

      expect(result.updated).to.be.true;
      expect(artist.save).to.have.been.called;
    });
  });

  describe('updateManager', () => {
    it('should update manager', async () => {
      const manager = {
        _id: 'manager123',
        name: 'Test Manager',
        save: sinon.stub().resolves({ _id: 'manager123', name: 'Test Manager', updated: true })
      };

      const result = await transactionRepository.updateManager(manager);

      expect(result.updated).to.be.true;
      expect(manager.save).to.have.been.called;
    });
  });
});