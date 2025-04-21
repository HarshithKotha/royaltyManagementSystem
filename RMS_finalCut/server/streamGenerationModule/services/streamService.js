const Royalty = require('../models/royaltyModel');
const Song = require('../models/songModel');  // Import the Song model
const { calculateRoyaltyForStreams } = require('./royaltyCalculationService');

// Function to generate random streams and update the database
const generateRandomStreams = async () => {
    try {
        const royalties = await Royalty.find();

        if (!royalties.length) {
            console.log('No royalties found to update.');
            return;
        }

        for (let royalty of royalties) {
            const randomStreams = Math.floor(Math.random() * 1000); // Random streams between 0 and 1000
            royalty.totalStreams += randomStreams; // Increment totalStreams in Royalty

            // Recalculate royalty
            const updatedRoyalty = calculateRoyaltyForStreams(royalty);
            // console.log(updatedRoyalty,'updatedroyalty')

            // Save updated royalty record
            await updatedRoyalty.save();

            console.log(`Updated streams for royalty ${royalty.royaltyId}: +${randomStreams} streams, Total Royalty: $${updatedRoyalty.totalRoyalty}`);

            // **Update the corresponding Song record**
            await Song.findOneAndUpdate(
                { _id: royalty.songId },  // Match the songId from Royalty
                { $inc: { totalStreams: randomStreams } }, // Increment song's totalStreams
                { new: true }
            );

            console.log(`Updated totalStreams in Song collection for songId: ${royalty.songId}`);
            // console.log(`Updated totalRoyalty in Song collection for songId: ${royalty.songId}`);
        }
    } catch (error) {
        console.error('Error generating random streams:', error.message);
    }
};

module.exports = { generateRandomStreams };
