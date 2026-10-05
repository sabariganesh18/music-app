const pool = require('../config/db');

// Get all public playlists + user playlists
exports.getPlaylists = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;

    let query = `
      SELECT 
        p.id,
        p.user_id,
        p.title,
        p.description,
        p.cover_image,
        p.is_public,
        p.created_at,
        u.name AS owner_name,
        COUNT(ps.song_id) AS total_tracks
      FROM playlists p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN playlist_songs ps ON p.id = ps.playlist_id
      WHERE p.is_public = TRUE ${userId ? 'OR p.user_id = ?' : ''}
      GROUP BY p.id
      ORDER BY p.updated_at DESC
    `;

    const params = userId ? [userId] : [];
    const [playlists] = await pool.query(query, params);

    return res.json({
      success: true,
      playlists
    });
  } catch (error) {
    console.error('Error fetching playlists:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving playlists.' });
  }
};

// Get current user's personal playlists
exports.getUserPlaylists = async (req, res) => {
  try {
    const userId = req.user.id;

    const [playlists] = await pool.query(`
      SELECT 
        p.id,
        p.user_id,
        p.title,
        p.description,
        p.cover_image,
        p.is_public,
        p.created_at,
        p.updated_at,
        COUNT(ps.song_id) AS total_tracks
      FROM playlists p
      LEFT JOIN playlist_songs ps ON p.id = ps.playlist_id
      WHERE p.user_id = ?
      GROUP BY p.id
      ORDER BY p.updated_at DESC
    `, [userId]);

    return res.json({
      success: true,
      playlists
    });
  } catch (error) {
    console.error('Error fetching user playlists:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving your playlists.' });
  }
};

// Get playlist by ID with its songs
exports.getPlaylistById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.id : null;

    const [playlists] = await pool.query(`
      SELECT 
        p.id,
        p.user_id,
        p.title,
        p.description,
        p.cover_image,
        p.is_public,
        p.created_at,
        p.updated_at,
        u.name AS owner_name
      FROM playlists p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `, [id]);

    if (playlists.length === 0) {
      return res.status(404).json({ success: false, message: 'Playlist not found.' });
    }

    const playlist = playlists[0];

    // Check privacy
    if (!playlist.is_public && (!userId || userId !== playlist.user_id)) {
      return res.status(403).json({ success: false, message: 'This playlist is private.' });
    }

    // Get songs inside playlist
    let songsQuery = `
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
        ps.added_at
        ${userId ? ', (ls.id IS NOT NULL) AS is_liked' : ', FALSE AS is_liked'}
      FROM playlist_songs ps
      JOIN songs s ON ps.song_id = s.id
      LEFT JOIN artists a ON s.artist_id = a.id
      LEFT JOIN albums al ON s.album_id = al.id
      ${userId ? 'LEFT JOIN liked_songs ls ON s.id = ls.song_id AND ls.user_id = ?' : ''}
      WHERE ps.playlist_id = ?
      ORDER BY ps.added_at ASC
    `;

    const songParams = userId ? [userId, id] : [id];
    const [songs] = await pool.query(songsQuery, songParams);

    return res.json({
      success: true,
      playlist: {
        ...playlist,
        is_owner: Boolean(userId && userId === playlist.user_id),
        songs: songs.map(s => ({ ...s, is_liked: Boolean(s.is_liked) }))
      }
    });
  } catch (error) {
    console.error('Error fetching playlist by ID:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving playlist.' });
  }
};

// Create new playlist
exports.createPlaylist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, description, cover_image, is_public } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Playlist title is required.' });
    }

    const defaultCover = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80';

    const [result] = await pool.query(
      'INSERT INTO playlists (user_id, title, description, cover_image, is_public) VALUES (?, ?, ?, ?, ?)',
      [
        userId,
        title.trim(),
        description ? description.trim() : '',
        cover_image || defaultCover,
        is_public !== undefined ? Boolean(is_public) : true
      ]
    );

    const newPlaylistId = result.insertId;

    const [created] = await pool.query(`
      SELECT 
        p.id,
        p.user_id,
        p.title,
        p.description,
        p.cover_image,
        p.is_public,
        p.created_at,
        0 AS total_tracks
      FROM playlists p
      WHERE p.id = ?
    `, [newPlaylistId]);

    return res.status(201).json({
      success: true,
      message: 'Playlist created successfully!',
      playlist: created[0]
    });
  } catch (error) {
    console.error('Error creating playlist:', error);
    return res.status(500).json({ success: false, message: 'Server error creating playlist.' });
  }
};

// Update playlist (rename, edit description)
exports.updatePlaylist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { title, description, cover_image, is_public } = req.body;

    // Check ownership
    const [playlists] = await pool.query('SELECT * FROM playlists WHERE id = ?', [id]);
    if (playlists.length === 0) {
      return res.status(404).json({ success: false, message: 'Playlist not found.' });
    }

    if (playlists[0].user_id !== userId) {
      return res.status(403).json({ success: false, message: 'You can only edit your own playlists.' });
    }

    const current = playlists[0];
    const newTitle = title !== undefined ? title.trim() : current.title;
    const newDesc = description !== undefined ? description : current.description;
    const newCover = cover_image !== undefined ? cover_image : current.cover_image;
    const newPublic = is_public !== undefined ? Boolean(is_public) : current.is_public;

    if (!newTitle) {
      return res.status(400).json({ success: false, message: 'Playlist title cannot be empty.' });
    }

    await pool.query(
      'UPDATE playlists SET title = ?, description = ?, cover_image = ?, is_public = ?, updated_at = NOW() WHERE id = ?',
      [newTitle, newDesc, newCover, newPublic, id]
    );

    const [updated] = await pool.query('SELECT * FROM playlists WHERE id = ?', [id]);

    return res.json({
      success: true,
      message: 'Playlist updated successfully!',
      playlist: updated[0]
    });
  } catch (error) {
    console.error('Error updating playlist:', error);
    return res.status(500).json({ success: false, message: 'Server error updating playlist.' });
  }
};

// Delete playlist
exports.deletePlaylist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const [playlists] = await pool.query('SELECT * FROM playlists WHERE id = ?', [id]);
    if (playlists.length === 0) {
      return res.status(404).json({ success: false, message: 'Playlist not found.' });
    }

    if (playlists[0].user_id !== userId) {
      return res.status(403).json({ success: false, message: 'You can only delete your own playlists.' });
    }

    await pool.query('DELETE FROM playlists WHERE id = ?', [id]);

    return res.json({
      success: true,
      message: 'Playlist deleted successfully!'
    });
  } catch (error) {
    console.error('Error deleting playlist:', error);
    return res.status(500).json({ success: false, message: 'Server error deleting playlist.' });
  }
};

// Add song to playlist
exports.addSongToPlaylist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { songId } = req.body;

    if (!songId) {
      return res.status(400).json({ success: false, message: 'Song ID is required.' });
    }

    // Verify playlist ownership
    const [playlists] = await pool.query('SELECT * FROM playlists WHERE id = ?', [id]);
    if (playlists.length === 0) {
      return res.status(404).json({ success: false, message: 'Playlist not found.' });
    }

    if (playlists[0].user_id !== userId) {
      return res.status(403).json({ success: false, message: 'You can only add songs to your own playlists.' });
    }

    // Insert or ignore if duplicate
    await pool.query(
      'INSERT IGNORE INTO playlist_songs (playlist_id, song_id) VALUES (?, ?)',
      [id, songId]
    );

    // Update playlist updated_at timestamp
    await pool.query('UPDATE playlists SET updated_at = NOW() WHERE id = ?', [id]);

    return res.json({
      success: true,
      message: 'Song added to playlist!'
    });
  } catch (error) {
    console.error('Error adding song to playlist:', error);
    return res.status(500).json({ success: false, message: 'Server error adding song to playlist.' });
  }
};

// Remove song from playlist
exports.removeSongFromPlaylist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id, songId } = req.params;

    // Verify playlist ownership
    const [playlists] = await pool.query('SELECT * FROM playlists WHERE id = ?', [id]);
    if (playlists.length === 0) {
      return res.status(404).json({ success: false, message: 'Playlist not found.' });
    }

    if (playlists[0].user_id !== userId) {
      return res.status(403).json({ success: false, message: 'You can only remove songs from your own playlists.' });
    }

    await pool.query(
      'DELETE FROM playlist_songs WHERE playlist_id = ? AND song_id = ?',
      [id, songId]
    );

    // Update playlist updated_at
    await pool.query('UPDATE playlists SET updated_at = NOW() WHERE id = ?', [id]);

    return res.json({
      success: true,
      message: 'Song removed from playlist!'
    });
  } catch (error) {
    console.error('Error removing song from playlist:', error);
    return res.status(500).json({ success: false, message: 'Server error removing song.' });
  }
};
