const mongoose = require('mongoose');

const ManagerSchema = new mongoose.Schema({
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User schema
  fullName: { type: String, required: true },
  username:{ type:String, required: true},
  email: { type: String, required: true, unique: true },
  mobileNo: { type: String },
  address: { type: String },
  description:{type: String},
  managedArtists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Artist' }], // List of artist IDs
  managerShare:{type:Number, default:0},
  commissionPercentage:{type: Number, default:12},
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Manager', ManagerSchema,'Manager');
