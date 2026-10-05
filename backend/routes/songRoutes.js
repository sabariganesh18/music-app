const express = require('express');
const router = express.Router();
const songController = require('../controllers/songController');
const { optionalAuth, authenticateToken } = require('../middleware/auth');

// Public / optionally authenticated routes
router.get('/songs', optionalAuth, songController.getSongs);
router.get('/songs/:id', optionalAuth, songController.getSongById);
router.get('/artists', songController.getArtists);
router.get('/artists/:id', optionalAuth, songController.getArtistById);
router.get('/albums', songController.getAlbums);
router.get('/albums/:id', optionalAuth, songController.getAlbumById);

// Play tracking & history
router.post('/songs/play', optionalAuth, songController.recordPlay);
router.get('/recently-played', authenticateToken, songController.getRecentlyPlayed);

module.exports = router;
