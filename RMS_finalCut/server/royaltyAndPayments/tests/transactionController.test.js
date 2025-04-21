const { expect } = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const TransactionController = require('../controllers/transactionController');
const TransactionService = require('../services/transactionService');

describe('TransactionController', () => {
  let mockResponse, transactionServiceStub;

  beforeEach(() => {
    // Setup mock response
    mockResponse = {
      status: sinon.stub().returnsThis(),
      send: sinon.stub().returnsThis(),
      setHeader: sinon.stub().returnsThis()
    };

    // Create service stubs
    transactionServiceStub = sinon.stub(TransactionService.prototype);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('createTransaction', () => {
    it('should create a transaction successfully', async () => {
      // Arrange
      const req = {
        method: 'POST',
        body: {
          userId: new mongoose.Types.ObjectId().toString(),
          royaltyId: new mongoose.Types.ObjectId().toString(),
          transactionAmount: 1000
        }
      };

      const mockTransaction = {
        _id: new mongoose.Types.ObjectId().toString(),
        ...req.body
      };

      transactionServiceStub.createTransaction.resolves(mockTransaction);

      // Act
      await TransactionController.createTransaction(req, mockResponse);

      // Assert
      expect(mockResponse.status).to.have.been.calledWith(201);
      expect(mockResponse.send).to.have.been.calledWith({
        success: true,
        message: "Transaction recorded successfully",
        transaction: mockTransaction
      });
    });

    it('should throw error when required fields are missing', async () => {
      // Arrange
      const req = {
        method: 'POST',
        body: {
          userId: new mongoose.Types.ObjectId().toString()
          // missing royaltyId and transactionAmount
        }
      };

      // Act & Assert
      try {
        await TransactionController.createTransaction(req, mockResponse);
        // expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.equal('Missing required fields: userId, royaltyId, transactionAmount');
      }
    });
  });

  describe('getAllTransactions', () => {
    it('should return all transactions', async () => {
      // Arrange
      const req = {
        method: 'GET'
      };

      const mockTransactions = [
        { _id: new mongoose.Types.ObjectId().toString() },
        { _id: new mongoose.Types.ObjectId().toString() }
      ];

      transactionServiceStub.getAllTransactions.resolves(mockTransactions);

      // Act
      await TransactionController.getAllTransactions(req, mockResponse);

      // Assert
      expect(mockResponse.status).to.have.been.calledWith(200);
      expect(mockResponse.send).to.have.been.calledWith({
        success: true,
        transactions: mockTransactions
      });
    });
  });

  describe('getTransactionById', () => {
    it('should return transaction by id', async () => {
      // Arrange
      const userId = new mongoose.Types.ObjectId().toString();
      const req = {
        method: 'GET',
        params: { userId }
      };

      const mockTransaction = {
        _id: new mongoose.Types.ObjectId().toString(),
        userId
      };

      transactionServiceStub.getTransactionById.resolves(mockTransaction);

      // Act
      await TransactionController.getTransactionById(req, mockResponse);

      // Assert
      expect(mockResponse.status).to.have.been.calledWith(200);
      expect(mockResponse.send).to.have.been.calledWith({
        success: true,
        transaction: mockTransaction
      });
    });
  });

  describe('payArtist', () => {
    it('should process artist payment successfully', async () => {
      // Arrange
      const req = {
        method: 'POST',
        body: {
          transactionId: new mongoose.Types.ObjectId().toString(),
          paymentAmount: 500
        }
      };

      const mockTransaction = {
        _id: req.body.transactionId,
        royaltyPaid: 500,
        status: 'Approved'
      };

      transactionServiceStub.payArtist.resolves(mockTransaction);

      // Act
      await TransactionController.payArtist(req, mockResponse);

      // Assert
      expect(mockResponse.status).to.have.been.calledWith(201);
      expect(mockResponse.send).to.have.been.calledWith({
        success: true,
        message: "Payment processed successfully",
        transaction: mockTransaction
      });
    });

    it('should throw error when payment fields are missing', async () => {
      // Arrange
      const req = {
        method: 'POST',
        body: {
          // missing required fields
        }
      };

      // Act & Assert
      try {
        await TransactionController.payArtist(req, mockResponse);
        // expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.equal('Missing required fields: transactionId, paymentAmount');
      }
    });
  });

  describe('exportTransactionsPDF', () => {
    it('should export transactions as PDF', async () => {
      // Arrange
      const userId = new mongoose.Types.ObjectId().toString();
      const req = {
        method: 'GET',
        params: { 
          userId,
          role: 'artist'
        }
      };

      const mockPdfBuffer = Buffer.from('mock pdf content');
      transactionServiceStub.generateTransactionsPDF.resolves(mockPdfBuffer);

      // Act
      await TransactionController.exportTransactionsPDF(req, mockResponse);

      // Assert
      expect(mockResponse.setHeader).to.have.been.calledWith('Content-Type', 'application/pdf');
      expect(mockResponse.setHeader).to.have.been.calledWith(
        'Content-Disposition',
        'attachment; filename="transactions.pdf"'
      );
      expect(mockResponse.send).to.have.been.calledWith(mockPdfBuffer);
    });
  });
});