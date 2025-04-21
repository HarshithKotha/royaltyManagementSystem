const Song = require('../models/songModel');
const Artist = require('../models/artistModel');
const Royalty = require('../models/royaltyModel');

class SongRepository {
  async createSong(songData) {
    return await Song.create(songData);
  }

  async findSongById(songId) {
    return await Song.findOne({ songId:songId });
  }

  async findSongsByArtistId(artistId) {
    return await Song.find({ artistId });
  }

  async findSongsBySongId(songId) {
    return await Song.find({ songId });
  }

  async modifySong(songId, updateData) {
    return await Song.findOneAndUpdate({ songId }, updateData, { new: true });
  }

  async removeSong(songId) {
    return await Song.findOneAndDelete({ songId });
  }

  async addSongToArtist(artistId, songId) {
    return await Artist.findByIdAndUpdate(
      artistId,
      { $addToSet: { songs: songId } },
      { new: true }
    );
  }

  async removeSongFromArtist(artistId, songId) {
    return await Artist.findByIdAndUpdate(
      artistId,
      { $pull: { songs: songId } },
      { new: true }
    );
  }

  async createRoyalty(royaltyData) {
    return await Royalty.create(royaltyData);
  }

  async deleteRoyalty(songId) {
    return await Royalty.deleteOne({ songId });
  }
}

module.exports = SongRepository;
