const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
// const chaiAsPromised = require('chai-as-promised');
const { expect } = chai;
const mongoose = require('mongoose');
const { Response } = require('ca-webutils/expressx');
const Song = require('../models/songModel');
const SongService = require('../services/songService');
const songController = require('../controllers/songController');

chai.use(sinonChai);
// chai.use(chaiAsPromised);
before(async () => {
    const chaiAsPromised = await import('chai-as-promised');
    chai.use(chaiAsPromised.default);
  });

  
describe('Song Controller Tests', () => {
    let sandbox;
    let req;
    let res;
    let next;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        
        // Mock SongService methods at the module level
        sandbox.stub(SongService.prototype);

        req = {
            body: {},
            params: {},
            query: {},
            path: '/songs',
            url: '/api/songs',
            method: 'POST',
            user: { id: 'testUserId' },
            token: 'testToken'
        };

        res = {
            status: sandbox.stub().returnsThis(),
            send: sandbox.stub().returnsThis(),
            set: sandbox.stub().returnsThis()
        };

        next = sandbox.stub();
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('uploadSong', () => {
        it('should successfully upload a song with valid data', async () => {
            const songData = {
                artistName: 'Test Artist',
                songName: 'Test Song',
                totalStreams: 0
            };

            const expectedResponse = {
                song: {
                    songId: 'test-song',
                    artistId: 'test-artist',
                    ...songData
                },
                newRoyalty: 0
            };

            req.body = songData;
            SongService.prototype.uploadSong.resolves(expectedResponse);

            await songController.uploadSong(req, res, next);

            expect(res.status).to.have.been.calledWith(201);
            expect(res.send).to.have.been.calledWith({
                success: true,
                message: "Song and Royalty created successfully",
                song: expectedResponse.song
            });
        });

        it('should handle missing required fields', async () => {
            req.body = { artistName: 'Test Artist' };
            
            await songController.uploadSong(req, res, next);

            // With expressx, errors are sent directly through res
            // expect(res.status).to.have.been.calledWith(400);
            expect(res.send).to.have.been.calledWith(
                sinon.match({
                    message: "Missing required fields: artistName, songName"
                })
            );
        });
    });

    describe('getSongById', () => {
        it('should return song when valid ID is provided', async () => {
            const songId = 'test-song-id';
            const expectedSong = {
                songId,
                songName: 'Test Song',
                artistName: 'Test Artist'
            };

            req.method = 'GET';
            req.params = { songId };
            SongService.prototype.getSongById.resolves(expectedSong);

            await songController.getSongById(req, res, next);

            expect(res.status).to.have.been.calledWith(200);
            expect(res.send).to.have.been.calledWith({
                success: true,
                song: expectedSong
            });
        });

        
    });

    describe('updateSong', () => {
        it('should update song with valid data', async () => {
            const songId = 'test-song-id';
            const updateData = {
                songName: 'Updated Song',
                totalStreams: 100
            };

            const expectedSong = {
                songId,
                ...updateData,
                updatedAt: new Date()
            };

            req.method = 'PUT';
            req.params = { songId };
            req.body = updateData;
            SongService.prototype.updateSong.resolves(expectedSong);

            await songController.updateSong(req, res, next);

            expect(res.status).to.have.been.calledWith(202);
            expect(res.send).to.have.been.calledWith({
                success: true,
                song: expectedSong
            });
        });
    });

    describe('deleteSong', () => {
        it('should successfully delete a song', async () => {
            const songId = 'test-song-id';
            const deletedSong = { songId };

            req.method = 'DELETE';
            req.params = { songId };
            SongService.prototype.deleteSong.resolves(deletedSong);

            await songController.deleteSong(req, res, next);

            expect(res.status).to.have.been.calledWith(204);
            expect(res.send).to.have.been.calledWith({
                success: true,
                message: 'Song and associated data deleted successfully',
                deletedSong: songId,
                royaltyDeleted: true
            });
        });

        it('should handle missing songId', async () => {
            req.method = 'DELETE';
            req.params = {};
            
            await songController.deleteSong(req, res, next);

            // expect(res.status).to.have.been.calledWith(400);
            expect(res.send).to.have.been.calledWith(
                sinon.match({
                    message: 'Missing required field: songId'
                })
            );
        });
    });
    describe('getSongsByArtistId', () => {
        it('should return songs when valid artistId is provided', async () => {
            const artistId = 'test-artist-id';
            const expectedSongs = [
                {
                    songId: 'song-1',
                    songName: 'Test Song 1',
                    artistName: 'Test Artist'
                },
                {
                    songId: 'song-2',
                    songName: 'Test Song 2',
                    artistName: 'Test Artist'
                }
            ];
    
            req.method = 'GET';
            req.params = { artistId };
            SongService.prototype.getSongsByArtistId.resolves(expectedSongs);
    
            await songController.getSongsByArtistId(req, res, next);
    
            expect(res.status).to.have.been.calledWith(200);
            expect(res.send).to.have.been.calledWith({
                success: true,
                songs: expectedSongs
            });
            expect(SongService.prototype.getSongsByArtistId).to.have.been.calledWith(artistId);
        });
    
       
    });
    
    describe('getSongsBySongId', () => {
        it('should return songs when valid songId is provided', async () => {
            const songId = 'test-song-id';
            const expectedSongs = [
                {
                    songId: 'test-song-id',
                    songName: 'Test Song',
                    artistName: 'Test Artist',
                    versions: ['original', 'remix']
                }
            ];
    
            req.method = 'GET';
            req.params = { songId };
            SongService.prototype.getSongsBySongId.resolves(expectedSongs);
    
            await songController.getSongsBySongId(req, res, next);
    
            expect(res.status).to.have.been.calledWith(200);
            expect(res.send).to.have.been.calledWith({
                success: true,
                songs: expectedSongs
            });
            expect(SongService.prototype.getSongsBySongId).to.have.been.calledWith(songId);
        });
    
    
        it('should handle case when songId parameter is missing', async () => {
            req.method = 'GET';
            req.params = {};
    
            await songController.getSongsBySongId(req, res, next);
    
            expect(res.status).to.have.been.calledWith(400);
            expect(res.send).to.have.been.calledWith(
                sinon.match({
                    message: sinon.match.string
                })
            );
        });
    });
});

describe('Song Model Tests', () => {
    let sandbox;
    
    beforeEach(() => {
        sandbox = sinon.createSandbox();
        
        // Mock mongoose methods
        sandbox.stub(mongoose.Model.prototype, 'save').resolves();
        sandbox.stub(Song, 'aggregate').resolves([{ totalRoyalty: 1000, totalStreams: 500 }]);
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should create a new song with valid data', () => {
        const songData = {
            artistId: new mongoose.Types.ObjectId(),
            artistName: 'Test Artist',
            songId: 'test-song',
            songName: 'Test Song',
            totalStreams: 0,
            totalRoyalty: 0
        };

        const song = new Song(songData);
        expect(song).to.have.property('artistId').that.deep.equals(songData.artistId);
        expect(song).to.have.property('songName', songData.songName);
        expect(song).to.have.property('totalStreams', 0);
    });

    it('should fail validation when required fields are missing', () => {
        const song = new Song({});
        const validationError = song.validateSync();
        expect(validationError).to.exist;
        expect(validationError.errors).to.have.property('artistId');
        expect(validationError.errors).to.have.property('artistName');
        expect(validationError.errors).to.have.property('songId');
        expect(validationError.errors).to.have.property('songName');
    });

   
});