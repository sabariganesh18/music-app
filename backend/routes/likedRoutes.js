const express = require('express');
const router = express.Router();
const likedController = require('../controllers/likedController');
const { authenticateToken } = require('../middleware/auth');

router.get('/liked', authenticateToken, likedController.getLikedSongs);
router.get('/liked/ids', authenticateToken, likedController.getLikedSongIds);
router.post('/liked/:songId', authenticateToken, likedController.likeSong);
router.delete('/liked/:songId', authenticateToken, likedController.unlikeSong);

module.exports = router;
