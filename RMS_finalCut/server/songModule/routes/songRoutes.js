const express = require('express');
const router = express.Router();
const songController = require('../controllers/songController');
const { verifyUser } = require('../middleware/authMiddleware');

router.post('/', verifyUser,songController.uploadSong);
router.get('/:songId', verifyUser,songController.getSongById);
router.get('/artist/:artistId',verifyUser, songController.getSongsByArtistId);
router.get('/song/:songId', verifyUser,songController.getSongsBySongId);
router.put('/:songId', verifyUser,songController.updateSong);
router.delete('/:songId', verifyUser,songController.deleteSong);

module.exports = router;
