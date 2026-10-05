const pool = require('../config/db');

// Get all songs liked by the logged-in user
exports.getLikedSongs = async (req, res) => {
  try {
    const userId = req.user.id;

    const [songs] = await pool.query(`
      SELECT 
        s.id,
        s.title,
        s.duration,
        s.audio_url,
        s.cover_image,
        s.genre,
        s.plays_count,
        a.id AS artist_id,
        a.name AS artist_name,
        al.id AS album_id,
        al.title AS album_title,
        ls.liked_at,
        TRUE AS is_liked
      FROM liked_songs ls
      JOIN songs s ON ls.song_id = s.id
      LEFT JOIN artists a ON s.artist_id = a.id
      LEFT JOIN albums al ON s.album_id = al.id
      WHERE ls.user_id = ?
      ORDER BY ls.liked_at DESC
    `, [userId]);

    return res.json({
      success: true,
      count: songs.length,
      songs: songs.map(s => ({ ...s, is_liked: true }))
    });
  } catch (error) {
    console.error('Error fetching liked songs:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving liked songs.' });
  }
};

// Get list of liked song IDs for fast UI lookup
exports.getLikedSongIds = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await pool.query('SELECT song_id FROM liked_songs WHERE user_id = ?', [userId]);
    const ids = rows.map(r => r.song_id);

    return res.json({
      success: true,
      likedSongIds: ids
    });
  } catch (error) {
    console.error('Error fetching liked song IDs:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving liked IDs.' });
  }
};

// Like a song
exports.likeSong = async (req, res) => {
  try {
    const userId = req.user.id;
    const { songId } = req.params;

    if (!songId) {
      return res.status(400).json({ success: false, message: 'Song ID is required.' });
    }

    // Verify song exists
    const [song] = await pool.query('SELECT id FROM songs WHERE id = ?', [songId]);
    if (song.length === 0) {
      return res.status(404).json({ success: false, message: 'Song not found.' });
    }

    await pool.query(
      'INSERT IGNORE INTO liked_songs (user_id, song_id, liked_at) VALUES (?, ?, NOW())',
      [userId, songId]
    );

    return res.json({
      success: true,
      message: 'Song added to your Liked Songs.'
    });
  } catch (error) {
    console.error('Error liking song:', error);
    return res.status(500).json({ success: false, message: 'Server error liking song.' });
  }
};

// Unlike a song
exports.unlikeSong = async (req, res) => {
  try {
    const userId = req.user.id;
    const { songId } = req.params;

    if (!songId) {
      return res.status(400).json({ success: false, message: 'Song ID is required.' });
    }

    await pool.query(
      'DELETE FROM liked_songs WHERE user_id = ? AND song_id = ?',
      [userId, songId]
    );

    return res.json({
      success: true,
      message: 'Song removed from your Liked Songs.'
    });
  } catch (error) {
    console.error('Error unliking song:', error);
    return res.status(500).json({ success: false, message: 'Server error unliking song.' });
  }
};
