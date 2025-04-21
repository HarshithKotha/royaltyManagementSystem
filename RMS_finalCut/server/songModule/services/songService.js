const SongRepository = require('../repositories/songRepository');
const RoyaltyService= require('../services/royaltyService');

const royaltyService = new RoyaltyService();

class SongService {
  constructor() {
    this.songRepository = new SongRepository(); // Dependency Injection
  }
  async uploadSong(songData, artistName, songName) {
    const song = await this.songRepository.createSong(songData);
    // Add song to artist's songs
    await this.songRepository.addSongToArtist(song.artistId, song._id);

    // Generate royalty and create entry
    const royaltyId = `${artistName}-${songName.toLowerCase().replace(/\s+/g, '-')}`;
    const newRoyalty = await royaltyService.createRoyalty({ royaltyId, artistId: song.artistId, songId: song._id });
    
    return { song, newRoyalty };
  }

  async getSongById(songId) {
    return await this.songRepository.findSongById(songId);
  }

  async getSongsByArtistId(artistId) {
    return await this.songRepository.findSongsByArtistId(artistId);
  }

  async getSongsBySongId(songId) {
    return await this.songRepository.findSongsBySongId(songId);
  }

  async updateSong(songId, updateData) {
    return await this.songRepository.modifySong(songId, updateData);
  }

  async deleteSong(songId) {
    // Get the song before deletion to ensure it's removed from Artist and Royalty
    const song = await this.songRepository.findSongById(songId);
    if (!song) throw new Error('Song not found');

    const artistId = song.artistId;
    // Remove song from artist and delete royalty
    const removedArtist=await this.songRepository.removeSongFromArtist(song.artistId, song._id);

    const deletedroyalty=await this.songRepository.deleteRoyalty(song._id);

    
    return await this.songRepository.removeSong(songId);
  }
}

module.exports = SongService;
