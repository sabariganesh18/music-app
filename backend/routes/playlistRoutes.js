const express = require('express');
const router = express.Router();
const playlistController = require('../controllers/playlistController');
const { optionalAuth, authenticateToken } = require('../middleware/auth');

router.get('/playlists', optionalAuth, playlistController.getPlaylists);
router.get('/user/playlists', authenticateToken, playlistController.getUserPlaylists);
router.get('/playlists/:id', optionalAuth, playlistController.getPlaylistById);

router.post('/playlists', authenticateToken, playlistController.createPlaylist);
router.put('/playlists/:id', authenticateToken, playlistController.updatePlaylist);
router.delete('/playlists/:id', authenticateToken, playlistController.deletePlaylist);

router.post('/playlists/:id/songs', authenticateToken, playlistController.addSongToPlaylist);
router.delete('/playlists/:id/songs/:songId', authenticateToken, playlistController.removeSongFromPlaylist);

module.exports = router;
