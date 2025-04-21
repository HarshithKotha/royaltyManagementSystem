const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({

  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Encrypted password
  email:{type: String, required:true, unique: true},
  role: { type: String, enum: ['Admin', 'Artist', 'Manager'], required: true },
isFirstLogin: { type: Boolean, default: true },
isActive:{type:Boolean, default:true}
});

module.exports = mongoose.model('User', UserSchema,'User');
