const { routeHandler } = require('ca-webutils/expressx');
const SongService = require('../services/songService');
const songService = new SongService();

const songController = {
    uploadSong: routeHandler(async ({ body }) => {
        const { artistName, songName, ...restBody } = body;

        if (!artistName || !songName) {
            throw new Error("Missing required fields: artistName, songName");
        }

        const songData = {
            songName:songName,
            artistName:artistName,
            songId: songName.toLowerCase().replace(/\s+/g, '-'),
            artistId: artistName.toLowerCase().replace(/\s+/g, '-'),
            totalStreams: 0,
            ...restBody
        };
        const { song, newRoyalty } = await songService.uploadSong(songData, artistName, songName);
        return { success: true, message: "Song and Royalty created successfully", song };
    }),

    getSongById: routeHandler(async ({ params }) => {
        const { songId } = params;
        const song = await songService.getSongById(songId);
        return { success: true, song };
    }),

    getSongsByArtistId: routeHandler(async ({ params }) => {
        const { artistId } = params;
        const songs = await songService.getSongsByArtistId(artistId);
        return { success: true, songs };
    }),

    getSongsBySongId: routeHandler(async ({ params }) => {
        const { songId } = params;
        const songs = await songService.getSongsBySongId(songId);
        return { success: true, songs };
    }),

    updateSong: routeHandler(async ({ params, body }) => {
        const { songId } = params;
        const updateData = { ...body, updatedAt: new Date() };

        if (body.songName) {
            updateData.songId = body.songName.toLowerCase().replace(/\s+/g, '-');
        }
        if (body.artistName) {
            updateData.artistId = body.artistName.toLowerCase().replace(/\s+/g, '-');
        }

        const updatedSong = await songService.updateSong(songId, updateData);
        return { success: true, song: updatedSong };
    }),

    deleteSong: routeHandler(async ({ params }) => {
        const { songId } = params;

        if (!songId) {
            throw new Error("Missing required field: songId");
        }

        const deletedSong = await songService.deleteSong(songId);
        return {
            success: true,
            message: "Song and associated data deleted successfully",
            deletedSong: deletedSong.songId,
            royaltyDeleted: true
        };
    })
};

module.exports = songController;