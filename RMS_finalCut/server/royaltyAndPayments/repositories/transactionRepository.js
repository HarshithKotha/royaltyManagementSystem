const Transaction = require("../models/transaction");
const Royalty = require("../models/royaltyModel");
const Artist = require("../models/artistModel");
const Manager = require("../models/managerModel");
const Song= require("../models/songModel");

class TransactionRepository {
  async findById(transactionId) {
    return await Transaction.findById(transactionId);
  }

  async findAllTransactions() {
    return await Transaction.find().populate("userId").populate("royaltyId").exec();
  }

  async findTransactionsByUserId(userId, role) {
    if (role === "artist") {
      return Transaction.find({ userId }).populate('royaltyId').populate('songId').populate('userId').populate({path:'userId',populate:{path:'manager'}}).exec();
    } else if (role === "manager") {
      const artists = await Artist.find({ manager: userId }).select("_id");
      
      const artistIds = artists.map(artist => artist._id);
      return await Transaction.find({ userId: { $in: artistIds } })
        .populate("royaltyId", "royaltyAmount artistId songId")
        .populate("userId", "username email")
        .populate("songId", "songName");
    } else {
      throw new Error("Invalid role");
    }
  }

  async createTransaction(transactionData) {
    const transaction = new Transaction(transactionData);
    return await transaction.save();
  }

  async updateTransaction(transaction) {
    return await transaction.save();
  }

  async deleteTransaction(transactionId) {
    return await Transaction.findByIdAndDelete(transactionId);
  }

  async findRoyaltyById(royaltyId) {
    return await Royalty.findById(royaltyId);
  }

  async findArtistById(artistId) {
    return await Artist.findById(artistId);
  }

  async findManagerById(managerId) {
    return await Manager.findById(managerId);
  }

  async updateRoyalty(royalty) {
    return await royalty.save();
  }

  async updateArtist(artist) {
    return await artist.save();
  }

  async updateManager(manager) {
    return await manager.save();
  }
}

module.exports = TransactionRepository;
