// test/unit/services/transactionService.test.js
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
// const chaiAsPromised = require('chai-as-promised');
const { expect } = chai;
const TransactionService = require('../services/transactionService');
const PDFDocument = require('pdfkit');

chai.use(sinonChai);
// chai.use(chaiAsPromised);
before(async () => {
    const chaiAsPromised = await import('chai-as-promised');
    chai.use(chaiAsPromised.default);
  });

describe('Transaction Service', () => {
  let transactionService, transactionRepositoryStub;

  beforeEach(() => {
    transactionRepositoryStub = {
      findById: sinon.stub(),
      findRoyaltyById: sinon.stub(),
      findArtistById: sinon.stub(),
      findManagerById: sinon.stub(),
      updateTransaction: sinon.stub(),
      updateRoyalty: sinon.stub(),
      updateManager: sinon.stub(),
      updateArtist: sinon.stub(),
      createTransaction: sinon.stub(),
      findAllTransactions: sinon.stub(),
      findTransactionsByUserId: sinon.stub(),
      deleteTransaction: sinon.stub()
    };
    
    transactionService = new TransactionService();
    transactionService.transactionRepository = transactionRepositoryStub;
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('payArtist', () => {
    it('should process payment and update all entities successfully', async () => {
      const transactionId = 'trans123';
      const paymentAmount = 1000;
      
      const mockTransaction = {
        _id: transactionId,
        royaltyPaid: 0,
        royaltyDue: 1000,
        managerShare: 0,
        artistShare: 0,
        status: 'Pending',
        save: sinon.stub().resolves()
      };
      
      const mockRoyalty = {
        _id: 'royalty123',
        artistId: 'artist123',
        royaltyPaid: 0,
        royaltyDue: 1000,
        save: sinon.stub().resolves()
      };
      
      const mockArtist = {
        _id: 'artist123',
        manager: 'manager123',
        artistShare: 0,
        save: sinon.stub().resolves()
      };
      
      const mockManager = {
        _id: 'manager123',
        commissionPercentage: 20,
        managerShare: 0,
        save: sinon.stub().resolves()
      };

      transactionRepositoryStub.findById.resolves(mockTransaction);
      transactionRepositoryStub.findRoyaltyById.resolves(mockRoyalty);
      transactionRepositoryStub.findArtistById.resolves(mockArtist);
      transactionRepositoryStub.findManagerById.resolves(mockManager);

      const result = await transactionService.payArtist(transactionId, paymentAmount);

      expect(result).to.have.property('transaction');
      expect(result.transaction.status).to.equal('Approved');
      expect(result).to.have.property('managerShare', 200); // 20% of 1000
      expect(result).to.have.property('artistShare', 800); // 80% of 1000
      expect(mockTransaction.royaltyPaid).to.equal(paymentAmount);
      expect(mockTransaction.royaltyDue).to.equal(0);
      
      expect(transactionRepositoryStub.updateTransaction).to.have.been.calledOnce;
      expect(transactionRepositoryStub.updateRoyalty).to.have.been.calledOnce;
      expect(transactionRepositoryStub.updateManager).to.have.been.calledOnce;
      expect(transactionRepositoryStub.updateArtist).to.have.been.calledOnce;
    });

    it('should throw error if transaction not found', async () => {
      transactionRepositoryStub.findById.resolves(null);

      await expect(transactionService.payArtist('nonexistent', 100))
        .to.be.rejectedWith('Transaction not found');
    });

    it('should throw error if royalty not found', async () => {
      const mockTransaction = {
        _id: 'trans123',
        royaltyId: 'royalty123'
      };
      transactionRepositoryStub.findById.resolves(mockTransaction);
      transactionRepositoryStub.findRoyaltyById.resolves(null);

      await expect(transactionService.payArtist('trans123', 100))
        .to.be.rejectedWith('Royalty record not found');
    });

    it('should throw error if artist not found', async () => {
      const mockTransaction = { _id: 'trans123' };
      const mockRoyalty = { artistId: 'artist123' };
      
      transactionRepositoryStub.findById.resolves(mockTransaction);
      transactionRepositoryStub.findRoyaltyById.resolves(mockRoyalty);
      transactionRepositoryStub.findArtistById.resolves(null);

      await expect(transactionService.payArtist('trans123', 100))
        .to.be.rejectedWith('Artist not found');
    });

    it('should throw error if manager not found', async () => {
      const mockTransaction = { _id: 'trans123' };
      const mockRoyalty = { artistId: 'artist123' };
      const mockArtist = { manager: 'manager123' };
      
      transactionRepositoryStub.findById.resolves(mockTransaction);
      transactionRepositoryStub.findRoyaltyById.resolves(mockRoyalty);
      transactionRepositoryStub.findArtistById.resolves(mockArtist);
      transactionRepositoryStub.findManagerById.resolves(null);

      await expect(transactionService.payArtist('trans123', 100))
        .to.be.rejectedWith('Manager not found');
    });
  });

  describe('createTransaction', () => {
    it('should create transaction successfully', async () => {
      const transactionData = {
        userId: 'user123',
        royaltyId: 'royalty123',
        transactionAmount: 100,
        songId: 'song123'
      };
      const mockRoyalty = { _id: 'royalty123' };
      const expectedTransaction = { ...transactionData, _id: 'trans123' };

      transactionRepositoryStub.findRoyaltyById.resolves(mockRoyalty);
      transactionRepositoryStub.createTransaction.resolves(expectedTransaction);

      const result = await transactionService.createTransaction(transactionData);

      expect(result).to.deep.equal(expectedTransaction);
      expect(transactionRepositoryStub.createTransaction).to.have.been.calledWith(transactionData);
    });

    it('should throw error if royalty not found', async () => {
      transactionRepositoryStub.findRoyaltyById.resolves(null);

      await expect(transactionService.createTransaction({
        royaltyId: 'nonexistent'
      })).to.be.rejectedWith('Royalty not found');
    });
  });

  describe('getAllTransactions', () => {
    it('should return all transactions', async () => {
      const expectedTransactions = [
        { _id: '1', amount: 100 },
        { _id: '2', amount: 200 }
      ];
      transactionRepositoryStub.findAllTransactions.resolves(expectedTransactions);

      const result = await transactionService.getAllTransactions();

      expect(result).to.deep.equal(expectedTransactions);
    });
  });

  describe('getTransactionById', () => {
    it('should return transaction by id', async () => {
      const transactionId = 'trans123';
      const expectedTransaction = { _id: transactionId, amount: 100 };
      
      transactionRepositoryStub.findById.resolves(expectedTransaction);

      const result = await transactionService.getTransactionById(transactionId);

      expect(result).to.deep.equal(expectedTransaction);
      expect(transactionRepositoryStub.findById).to.have.been.calledWith(transactionId);
    });
  });

  describe('getTransactionsByUserId', () => {
    it('should return transactions for a user', async () => {
      const userId = 'user123';
      const role = 'artist';
      const expectedTransactions = [
        { _id: '1', userId, amount: 100 },
        { _id: '2', userId, amount: 200 }
      ];
      
      transactionRepositoryStub.findTransactionsByUserId.resolves(expectedTransactions);

      const result = await transactionService.getTransactionsByUserId(userId, role);

      expect(result).to.deep.equal(expectedTransactions);
      expect(transactionRepositoryStub.findTransactionsByUserId)
        .to.have.been.calledWith(userId, role);
    });
  });

  describe('deleteTransaction', () => {
    it('should delete transaction successfully', async () => {
      const transactionId = 'trans123';
      const expectedResult = { _id: transactionId, deleted: true };
      
      transactionRepositoryStub.deleteTransaction.resolves(expectedResult);

      const result = await transactionService.deleteTransaction(transactionId);

      expect(result).to.deep.equal(expectedResult);
      expect(transactionRepositoryStub.deleteTransaction)
        .to.have.been.calledWith(transactionId);
    });
  });

  describe('generateTransactionsPDF', () => {
    it('should generate PDF successfully', async () => {
      const userId = 'user123';
      const role = 'artist';
      const mockTransactions = [{
        _id: '1',
        transactionDate: new Date(),
        transactionAmount: 100,
        royaltyPaid: 80,
        artistShare: 60,
        managerShare: 20,
        songId: { songName: 'Test Song' }
      }];
      const mockUser = {
        username: 'testUser',
        email: 'test@example.com'
      };

      transactionRepositoryStub.findTransactionsByUserId.resolves(mockTransactions);
      if (role === 'artist') {
        transactionRepositoryStub.findArtistById.resolves(mockUser);
      } else {
        transactionRepositoryStub.findManagerById.resolves(mockUser);
      }

      const result = await transactionService.generateTransactionsPDF(userId, role);

      expect(Buffer.isBuffer(result)).to.be.true;
      expect(transactionRepositoryStub.findTransactionsByUserId)
        .to.have.been.calledWith(userId, role);
    });

    it('should throw error if no transactions found', async () => {
      transactionRepositoryStub.findTransactionsByUserId.resolves([]);

      await expect(transactionService.generateTransactionsPDF('user123', 'artist'))
        .to.be.rejectedWith('No transactions found for this user.');
    });
  });
});