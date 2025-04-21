const Royalty = require('../models/royaltyModel');
const Song=require('../models/songModel');
const Artist = require('../models/artistModel');

class RoyaltyRepository {
    // Create a new royalty
    async create(royaltyId,artistId,songId) {
        const royalty = new Royalty({royaltyId,artistId,songId});

        return await royalty.save();
    }

    // Get royalty by ID
    async findById(royaltyId) {
        return await Royalty.findOne({ royaltyId });
    }

    // Get royalties by artist ID
    async findByArtistId(artistId) {
        return await Royalty.find({ artistId:artistId }).populate('artistId').populate('songId');
    }

    async findSongsByArtistId(artistId) {
        return await Song.find({ artistId:artistId });
    }

    async updateArtistRoyalty(artistId, fullRoyalty, totalRoyaltyPaid, totalRoyaltyDue, totalStreams) {
        return await Artist.findOneAndUpdate(
            { _id: artistId },
            { fullRoyalty, totalRoyaltyPaid, totalRoyaltyDue, totalStreams }
        );
    }

}

module.exports = RoyaltyRepository;
