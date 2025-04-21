const mongoose = require('mongoose');


const CollaborationSchema = new mongoose.Schema({
  collaborationId: { type: String, required: true, unique: true },
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Manager', required: true },
  artistId: { type: mongoose.Schema.Types.ObjectId, ref: 'Artist', required: true },
  collaborationDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected',"cancel_requested"], default: 'Pending' },
  cancellationReason: { type: String, default: null }, // Artist's reason for cancellation
  managerDecision: { type: String, enum: ['approved', 'declined'], default: null }, // Manager's response
});
 
module.exports = mongoose.model('Collaboration', CollaborationSchema, 'Collaboration');