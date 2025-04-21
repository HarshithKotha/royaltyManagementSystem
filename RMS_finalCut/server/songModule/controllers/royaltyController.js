const { routeHandler } = require('ca-webutils/expressx');
const RoyaltyService = require('../services/royaltyService');
const royaltyService = new RoyaltyService();

const royaltyController = {
    createRoyaltyController: routeHandler(async ({ body }) => {
        const { artistId, songId, artistName, songName } = body;
        const royaltyId = `${artistName}-${songName.toLowerCase().replace(/\s+/g, '-')}`;
        
        const newRoyalty = await royaltyService.createRoyalty({ royaltyId, artistId, songId });
        return { success: true, royalty: newRoyalty };
    }),

    getRoyaltyByIdController: routeHandler(async ({ params }) => {
        const { royaltyId } = params;
        const royalty = await royaltyService.getRoyaltyById(royaltyId);
        return { success: true, royalty };
    }),

    getRoyaltyByArtistIdController: routeHandler(async ({ params }) => {
        const { artistId } = params;
        const royalties = await royaltyService.getRoyaltyByArtistId(artistId);
        return { success: true, royalties };
    })
};

module.exports = royaltyController;