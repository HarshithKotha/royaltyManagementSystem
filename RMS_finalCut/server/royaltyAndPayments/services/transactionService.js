const PDFDocument = require("pdfkit");
const TransactionRepository = require("../repositories/transactionRepository");

class TransactionService {
  constructor() {
    this.transactionRepository = new TransactionRepository(); // Dependency Injection
  }

  async payArtist(transactionId, paymentAmount) {
    const transaction = await this.transactionRepository.findById(transactionId);
    if (!transaction) throw new Error("Transaction not found");

    const royalty = await this.transactionRepository.findRoyaltyById(transaction.royaltyId);
    if (!royalty) throw new Error("Royalty record not found");

    const artist = await this.transactionRepository.findArtistById(royalty.artistId);
    if (!artist) throw new Error("Artist not found");

    const manager = await this.transactionRepository.findManagerById(artist.manager);
    if (!manager) throw new Error("Manager not found");

    // Calculate Manager and Artist share
    const managerShare = (paymentAmount * manager.commissionPercentage) / 100;
    const artistShare = paymentAmount - managerShare;

    // Update transaction details
    transaction.royaltyPaid += paymentAmount;
    transaction.royaltyDue -= paymentAmount;
    transaction.managerShare = (transaction.managerShare || 0) + managerShare;
    transaction.artistShare = (transaction.artistShare || 0) + artistShare;
    transaction.status = "Approved";

    // Update Royalty details
    royalty.royaltyPaid += paymentAmount;
    royalty.royaltyDue -= paymentAmount;

    // Update Manager's and Artist's earnings
    manager.managerShare = (manager.managerShare || 0) + managerShare;
    artist.artistShare = (artist.artistShare || 0) + artistShare;

    // Save changes to DB
    await this.transactionRepository.updateTransaction(transaction);
    await this.transactionRepository.updateRoyalty(royalty);
    await this.transactionRepository.updateManager(manager);
    await this.transactionRepository.updateArtist(artist);

    return { transaction, managerShare, artistShare };
  }

  async createTransaction(data) {
    const royalty = await this.transactionRepository.findRoyaltyById(data.royaltyId);
    if (!royalty) throw new Error("Royalty not found");

    return await this.transactionRepository.createTransaction(data);
  }

  async getAllTransactions() {
    return await this.transactionRepository.findAllTransactions();
  }

  async getTransactionById(id) {
    return await this.transactionRepository.findById(id);
  }

  async getTransactionsByUserId(userId, role) {
    return await this.transactionRepository.findTransactionsByUserId(userId, role);
  }

  async deleteTransaction(id) {
    return await this.transactionRepository.deleteTransaction(id);
  }

  async generateTransactionsPDF(userId, role) {
    const transactions = await this.transactionRepository.findTransactionsByUserId(userId, role);
    if (!transactions.length) throw new Error("No transactions found for this user.");

    const userData = role === "artist"
      ? await this.transactionRepository.findArtistById(userId)
      : await this.transactionRepository.findManagerById(userId);

    const doc = new PDFDocument({ margin: 50, size: "A4" });
    let buffers = [];
    doc.on("data", chunk => buffers.push(chunk));

     // Define column widths and positions
     const columns = {
      date: { x: 50, width: 80 },
      songName: { x: 130, width: 180 },
      amount: { x: 310, width: 80 },
      royalty: { x: 390, width: 80 },
      share: { x: 470, width: 80 }
    };

    // Helper function to truncate text
    const truncateText = (text, width) => {
      if (!text) return 'N/A';
      if (doc.widthOfString(text) <= width) return text;
      let truncated = text;
      while (doc.widthOfString(truncated + '...') > width && truncated.length > 0) {
        truncated = truncated.slice(0, -1);
      }
      return truncated + '...';
    };

    // Helper function to draw a row with proper text alignment
    const drawRow = (items, isHeader = false) => {
      const y = doc.y;
      const textOptions = { width: 0, align: 'left' };
      
      if (isHeader) {
        doc.font('Helvetica-Bold');
      } else {
        doc.font('Helvetica');
      }

      // Date
      doc.text(items.date, columns.date.x, y, {
        ...textOptions,
        width: columns.date.width
      });

      // Song Name
      doc.text(
        truncateText(items.songName, columns.songName.width),
        columns.songName.x,
        y,
        {
          ...textOptions,
          width: columns.songName.width
        }
      );

      // Amount
      doc.text(items.amount, columns.amount.x, y, {
        ...textOptions,
        width: columns.amount.width,
        align: 'right'
      });

      // Royalty
      doc.text(items.royalty, columns.royalty.x, y, {
        ...textOptions,
        width: columns.royalty.width,
        align: 'right'
      });

      // Share
      doc.text(items.share, columns.share.x, y, {
        ...textOptions,
        width: columns.share.width,
        align: 'right'
      });

      doc.moveDown();
    };


    // PDF Header
    doc.fontSize(18).font("Helvetica-Bold").text("Transaction Report", { align: "center" });
    doc.moveDown();

    doc.fontSize(12).font("Helvetica").text(`User: ${userData.username} | Email: ${userData.email}`);
    doc.moveDown();

    // Table Headers
    doc.fontSize(10);
    drawRow(
      {
        date: "Date",
        songName: "Song Name",
        amount: "Amount",
        royalty: "Royalty Paid",
        share: role === "artist" ? "Artist Share" : "Manager Share"
      },
      true
    );

    // Draw divider line
    doc.moveTo(50, doc.y)
      .lineTo(550, doc.y)
      .stroke();
    doc.moveDown(0.5);

    // Calculate totals while adding transactions
    let totalAmount = 0;
    let totalRoyalty = 0;
    let totalShare = 0;

    // Add Transactions
    transactions.forEach((txn) => {
      totalAmount += txn.transactionAmount;
      totalRoyalty += txn.royaltyPaid;
      totalShare += role === "artist" ? txn.artistShare : txn.managerShare;

      drawRow({
        date: new Date(txn.transactionDate).toLocaleDateString(),
        songName: txn.songId ? txn.songId.songName : "Unknown",
        amount: `$${txn.transactionAmount.toFixed(2)}`,
        royalty: `$${txn.royaltyPaid.toFixed(2)}`,
        share: `$${(role === "artist" ? txn.artistShare : txn.managerShare).toFixed(2)}`
      });
    });

    // Add a divider line before totals
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y)
      .lineTo(550, doc.y)
      .stroke();
    doc.moveDown(0.5);

    // Add totals row
    doc.font('Helvetica-Bold').fontSize(10);
    drawRow({
      date: "",
      songName: "Total",
      amount: `$${totalAmount.toFixed(2)}`,
      royalty: `$${totalRoyalty.toFixed(2)}`,
      share: `$${totalShare.toFixed(2)}`
    }, true);


    doc.end();

    return new Promise(resolve => {
      doc.on("end", () => resolve(Buffer.concat(buffers)));
    });
  }
}

module.exports = TransactionService;
