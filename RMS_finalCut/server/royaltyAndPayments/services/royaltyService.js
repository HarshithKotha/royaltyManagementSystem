const RoyaltyRepository = require('../repositories/royaltyRepository');

class RoyaltyService {
    constructor() {
        this.royaltyRepository = new RoyaltyRepository();
    }

    async updateArtistFullRoyalty(artistId) {
        try {
            const artistSongs = await this.royaltyRepository.findSongsByArtistId(artistId);
            const totalStreams = artistSongs.reduce((sum, song) => sum + (song.totalStreams || 0), 0);
            const totalRoyalty = artistSongs.reduce((sum, song) => sum + (song.totalRoyalty || 0), 0);
            const totalRoyaltyPaid = artistSongs.reduce((sum, song) => sum + (song.royaltyPaid || 0), 0);
            const totalRoyaltyDue = artistSongs.reduce((sum, song) => sum + (song.royaltyDue || 0), 0);

            await this.royaltyRepository.updateArtistRoyalty(artistId, totalRoyalty, totalRoyaltyPaid, totalRoyaltyDue, totalStreams);
        } catch (error) {
            console.error("Error updating artist fullRoyalty:", error);
            throw error;
        }
    }

    // Create a new royalty
    async createRoyalty(royaltyData) {
        const { royaltyId, artistId, songId } = royaltyData;
        const newRoyalty = await this.royaltyRepository.create(royaltyId,artistId,songId);
        await this.updateArtistFullRoyalty(royaltyData.artistId);
        return newRoyalty;
    }

    // Get royalty by ID and update artist fullRoyalty
    async getRoyaltyById(royaltyId) {
        const royalty = await this.royaltyRepository.findById(royaltyId);
        if (royalty) {
            await this.updateArtistFullRoyalty(royalty.artistId);
        }
        return royalty;
    }

    // Get royalties by artist ID and update artist fullRoyalty
    async getRoyaltyByArtistId(artistId) {
        const royalties = await this.royaltyRepository.findByArtistId(artistId);
        if (royalties.length > 0) {
            await this.updateArtistFullRoyalty(artistId);
        }
        return royalties;
    }
}

module.exports = RoyaltyService;
