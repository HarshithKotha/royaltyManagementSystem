const User = require('../models/userModel');
const Manager = require('../models/managerModel');
const Artist = require('../models/artistModel');
const Song= require('../models/songModel');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

class UserRepository {
  // Save a new user
  async createUser(userData) {
    const { username, password, email, role, ...rest } = userData;
    const user = new User({ username, password, email, role });
    return await user.save();
  }

   // Save Manager details after user creation
   async createManager(managerData) {
    const manager = new Manager(managerData);
    return await manager.save();
  }

  // Save Artist details after user creation
  async createArtist(artistData) {
    const artist = new Artist(artistData);
    return await artist.save();
  }

  // Find user by username
  async findUserByUsername(username) {
    return await User.findOne({ username: username });
  }

  // Find user profile by role
  async findUserProfileByRole(userId, role) {
    if (role === 'Artist') {

      let user1=await Artist.findOne({ artistId: userId }).populate('songs').populate('manager').lean();

      return user1;
    } else if (role === 'Manager') {

      return await Manager.findOne({ managerId: userId }).populate('managedArtists').lean();
    }
    return null;
  }

  // Update user profile based on role
  async updateUserProfile(userId, role, updateData) {
    if (role === 'Artist') {
      return await Artist.findOneAndUpdate(
        { artistId: userId },
        updateData,
        { new: true }
      );
    } else if (role === 'Manager') {
      return await Manager.findOneAndUpdate(
        { managerId: userId },
        updateData,
        { new: true }
      );
    }
    return null;
  }

  // Delete user and associated profile
  async deleteUser(userId, role) {
    if (role === 'Manager') {
      await Manager.deleteOne({ managerId: userId });
    } else if (role === 'Artist') {
      await Artist.deleteOne({ artistId: userId });
    }
    await User.deleteOne({ _id: userId });
  }

  // Get all users by role
  async getAllUsersByRole(role) {
    if (role === 'Artist') {
      return await Artist.find();
    } else if (role === 'Manager') {
      return await Manager.find();
    } else if (role === 'User') {
      return await User.find();
    }
    return null;
  }

  async updateUserStatusById(userId, isActive) {
    return await User.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true }
    );
  }

}

module.exports = UserRepository;
