const mongoose = require('mongoose');
const Collaboration = require('../models/collaborationModel');
const Manager = require('../models/managerModel');
const Artist = require('../models/artistModel');

class CollaborationRepository {
  // Create a new collaboration
  async createCollaboration(collaborationData) {
    const collaboration = new Collaboration(collaborationData);
    return await collaboration.save();
  }

  // Get collaborations by user and role (manager or artist)
  async getCollaborationsByUserAndRole(userId, role) {
    const query = role === 'Manager' ? { managerId: userId } : { artistId: userId };
    return await Collaboration.find(query)
      .populate('managerId')
      .populate('artistId')
      .lean();
  }

  async findCollaborationById(collaborationId) {
    return await Collaboration.findOne({ _id: collaborationId });
  }

  // Update collaboration status
  async updateCollaborationStatus(collaborationId, status) {
    if (status === 'Approved') {
      return await Collaboration.findByIdAndUpdate(collaborationId, { status }, { new: true });
    }
    else {
      await Collaboration.findByIdAndUpdate(collaborationId, { status }, { new: true });
      await Collaboration.findByIdAndDelete(collaborationId);
      return true;
    }

  }

  async updateManagerManagedArtists(managerId, artistId) {
    return await Manager.findByIdAndUpdate(
      managerId,
      { $addToSet: { managedArtists: artistId } }, 
      { new: true }
    );
  }

  async updateArtistManager(artistId, managerId) {
    return await Artist.findByIdAndUpdate(
      artistId,
      { $set: { manager: managerId } },
      { new: true }
    );
  }


  // Request cancellation (Artist initiates)
  async requestCancellation(collaborationId, cancellationReason) {
    return await Collaboration.findByIdAndUpdate(
      collaborationId,
      { status: "cancel_requested", cancellationReason: cancellationReason },
      { new: true }
    );
  }

  // Handle manager’s response (Approve or Decline)
  async handleCancellationResponse(collaborationId, decision) {
    const collaboration = await Collaboration.findById(collaborationId);
    if (decision === "approved") {
      // Remove manager from artist record
      await Artist.findByIdAndUpdate(collaboration.artistId, { $unset: { manager: "" } });

      // Remove artist from manager’s managedArtists list
      await Manager.findByIdAndUpdate(collaboration?.managerId, {
        $pull: { managedArtists: collaboration?.artistId }
      });

      collaboration.status = "Rejected";
      // Delete the collaboration document if status is "Rejected"
      let deletedCollab = await Collaboration.findByIdAndDelete(collaborationId);
      return deletedCollab;

    } else if (decision === "declined") {
      // Simply reset the status to "Approved" if the request is declined
      collaboration.status = "Approved";
      await collaboration.save();
      return collaboration;

    }
  }
}

module.exports = CollaborationRepository;


