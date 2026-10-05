const pool = require('../config/db');

// Get all songs with optional search, artist, album, and genre filters
exports.getSongs = async (req, res) => {
  try {
    const { search, artist_id, album_id, genre } = req.query;
    const userId = req.user ? req.user.id : null;

    let query = `
      SELECT 
        s.id,
        s.title,
        s.duration,
        s.audio_url,
        s.cover_image,
        s.genre,
        s.plays_count,
        s.created_at,
        a.id AS artist_id,
        a.name AS artist_name,
        a.image_url AS artist_image,
        al.id AS album_id,
        al.title AS album_title
        ${userId ? ', (ls.id IS NOT NULL) AS is_liked' : ', FALSE AS is_liked'}
      FROM songs s
      LEFT JOIN artists a ON s.artist_id = a.id
      LEFT JOIN albums al ON s.album_id = al.id
      ${userId ? 'LEFT JOIN liked_songs ls ON s.id = ls.song_id AND ls.user_id = ?' : ''}
      WHERE 1=1
    `;

    const params = [];
    if (userId) {
      params.push(userId);
    }

    if (search) {
      query += ` AND (s.title LIKE ? OR a.name LIKE ? OR al.title LIKE ? OR s.genre LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    if (artist_id) {
      query += ` AND s.artist_id = ?`;
      params.push(artist_id);
    }

    if (album_id) {
      query += ` AND s.album_id = ?`;
      params.push(album_id);
    }

    if (genre) {
      query += ` AND s.genre = ?`;
      params.push(genre);
    }

    query += ` ORDER BY s.plays_count DESC, s.id ASC`;

    const [songs] = await pool.query(query, params);

    return res.json({
      success: true,
      count: songs.length,
      songs: songs.map(song => ({
        ...song,
        is_liked: Boolean(song.is_liked)
      }))
    });
  } catch (error) {
    console.error('Error fetching songs:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving songs.' });
  }
};

// Get single song by ID
exports.getSongById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.id : null;

    let query = `
      SELECT 
        s.id,
        s.title,
        s.duration,
        s.audio_url,
        s.cover_image,
        s.genre,
        s.plays_count,
        s.created_at,
        a.id AS artist_id,
        a.name AS artist_name,
        a.image_url AS artist_image,
        al.id AS album_id,
        al.title AS album_title
        ${userId ? ', (ls.id IS NOT NULL) AS is_liked' : ', FALSE AS is_liked'}
      FROM songs s
      LEFT JOIN artists a ON s.artist_id = a.id
      LEFT JOIN albums al ON s.album_id = al.id
      ${userId ? 'LEFT JOIN liked_songs ls ON s.id = ls.song_id AND ls.user_id = ?' : ''}
      WHERE s.id = ?
    `;

    const params = userId ? [userId, id] : [id];
    const [songs] = await pool.query(query, params);

    if (songs.length === 0) {
      return res.status(404).json({ success: false, message: 'Song not found.' });
    }

    return res.json({
      success: true,
      song: {
        ...songs[0],
        is_liked: Boolean(songs[0].is_liked)
      }
    });
  } catch (error) {
    console.error('Error fetching song by ID:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving song.' });
  }
};

// Get all artists
exports.getArtists = async (req, res) => {
  try {
    const [artists] = await pool.query(`
      SELECT 
        a.id,
        a.name,
        a.bio,
        a.image_url,
        a.monthly_listeners,
        COUNT(DISTINCT s.id) AS total_songs,
        COUNT(DISTINCT al.id) AS total_albums
      FROM artists a
      LEFT JOIN songs s ON a.id = s.artist_id
      LEFT JOIN albums al ON a.id = al.artist_id
      GROUP BY a.id
      ORDER BY a.monthly_listeners DESC
    `);

    return res.json({
      success: true,
      artists
    });
  } catch (error) {
    console.error('Error fetching artists:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving artists.' });
  }
};

// Get artist by ID with their songs and albums
exports.getArtistById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.id : null;

    const [artists] = await pool.query('SELECT * FROM artists WHERE id = ?', [id]);
    if (artists.length === 0) {
      return res.status(404).json({ success: false, message: 'Artist not found.' });
    }

    const artist = artists[0];

    // Artist songs
    let songsQuery = `
      SELECT 
        s.id,
        s.title,
        s.duration,
        s.audio_url,
        s.cover_image,
        s.genre,
        s.plays_count,
        al.id AS album_id,
        al.title AS album_title
        ${userId ? ', (ls.id IS NOT NULL) AS is_liked' : ', FALSE AS is_liked'}
      FROM songs s
      LEFT JOIN albums al ON s.album_id = al.id
      ${userId ? 'LEFT JOIN liked_songs ls ON s.id = ls.song_id AND ls.user_id = ?' : ''}
      WHERE s.artist_id = ?
      ORDER BY s.plays_count DESC
    `;

    const songParams = userId ? [userId, id] : [id];
    const [songs] = await pool.query(songsQuery, songParams);

    // Artist albums
    const [albums] = await pool.query(
      'SELECT id, title, cover_image, release_year, genre FROM albums WHERE artist_id = ? ORDER BY release_year DESC',
      [id]
    );

    return res.json({
      success: true,
      artist: {
        ...artist,
        songs: songs.map(s => ({ ...s, artist_name: artist.name, is_liked: Boolean(s.is_liked) })),
        albums
      }
    });
  } catch (error) {
    console.error('Error fetching artist by ID:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving artist.' });
  }
};

// Get all albums
exports.getAlbums = async (req, res) => {
  try {
    const [albums] = await pool.query(`
      SELECT 
        al.id,
        al.title,
        al.cover_image,
        al.release_year,
        al.genre,
        a.id AS artist_id,
        a.name AS artist_name,
        COUNT(s.id) AS track_count
      FROM albums al
      LEFT JOIN artists a ON al.artist_id = a.id
      LEFT JOIN songs s ON al.id = s.album_id
      GROUP BY al.id
      ORDER BY al.release_year DESC
    `);

    return res.json({
      success: true,
      albums
    });
  } catch (error) {
    console.error('Error fetching albums:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving albums.' });
  }
};

// Get album by ID with its tracks
exports.getAlbumById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.id : null;

    const [albums] = await pool.query(`
      SELECT 
        al.id,
        al.title,
        al.cover_image,
        al.release_year,
        al.genre,
        a.id AS artist_id,
        a.name AS artist_name,
        a.image_url AS artist_image
      FROM albums al
      LEFT JOIN artists a ON al.artist_id = a.id
      WHERE al.id = ?
    `, [id]);

    if (albums.length === 0) {
      return res.status(404).json({ success: false, message: 'Album not found.' });
    }

    const album = albums[0];

    // Get songs in this album
    let songsQuery = `
      SELECT 
        s.id,
        s.title,
        s.duration,
        s.audio_url,
        s.cover_image,
        s.genre,
        s.plays_count,
        a.name AS artist_name
        ${userId ? ', (ls.id IS NOT NULL) AS is_liked' : ', FALSE AS is_liked'}
      FROM songs s
      LEFT JOIN artists a ON s.artist_id = a.id
      ${userId ? 'LEFT JOIN liked_songs ls ON s.id = ls.song_id AND ls.user_id = ?' : ''}
      WHERE s.album_id = ?
      ORDER BY s.id ASC
    `;

    const songParams = userId ? [userId, id] : [id];
    const [songs] = await pool.query(songsQuery, songParams);

    return res.json({
      success: true,
      album: {
        ...album,
        songs: songs.map(s => ({ ...s, album_title: album.title, is_liked: Boolean(s.is_liked) }))
      }
    });
  } catch (error) {
    console.error('Error fetching album by ID:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving album.' });
  }
};

// Get recently played songs for logged-in user
exports.getRecentlyPlayed = async (req, res) => {
  try {
    const userId = req.user.id;

    const [recent] = await pool.query(`
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
        rp.played_at,
        (ls.id IS NOT NULL) AS is_liked
      FROM recently_played rp
      JOIN songs s ON rp.song_id = s.id
      LEFT JOIN artists a ON s.artist_id = a.id
      LEFT JOIN albums al ON s.album_id = al.id
      LEFT JOIN liked_songs ls ON s.id = ls.song_id AND ls.user_id = ?
      WHERE rp.user_id = ?
      ORDER BY rp.played_at DESC
      LIMIT 20
    `, [userId, userId]);

    return res.json({
      success: true,
      recent: recent.map(r => ({ ...r, is_liked: Boolean(r.is_liked) }))
    });
  } catch (error) {
    console.error('Error fetching recently played:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving recently played songs.' });
  }
};

// Record a song play (and update recently_played)
exports.recordPlay = async (req, res) => {
  try {
    const { songId } = req.body;
    const userId = req.user ? req.user.id : null;

    if (!songId) {
      return res.status(400).json({ success: false, message: 'Song ID is required.' });
    }

    // 1. Increment total play count on the song
    await pool.query('UPDATE songs SET plays_count = plays_count + 1 WHERE id = ?', [songId]);

    // 2. If user is authenticated, update recently played table
    if (userId) {
      await pool.query(`
        INSERT INTO recently_played (user_id, song_id, played_at)
        VALUES (?, ?, NOW())
        ON DUPLICATE KEY UPDATE played_at = NOW()
      `, [userId, songId]);
    }

    return res.json({ success: true, message: 'Play recorded.' });
  } catch (error) {
    console.error('Error recording play:', error);
    return res.status(500).json({ success: false, message: 'Server error recording play.' });
  }
};
