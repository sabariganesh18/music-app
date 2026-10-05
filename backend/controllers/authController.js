const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { JWT_SECRET } = require('../middleware/auth');

// Register a new user
exports.register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    // Check if user already exists
    const [existingUsers] = await pool.query('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existingUsers.length > 0) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const defaultAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=1db954,107c41&textColor=ffffff`;

    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, avatar_url) VALUES (?, ?, ?, ?)',
      [name.trim(), email.toLowerCase().trim(), hashedPassword, defaultAvatar]
    );

    const userId = result.insertId;

    // Create a default "My Playlist" for the new user
    await pool.query(
      'INSERT INTO playlists (user_id, title, description) VALUES (?, ?, ?)',
      [userId, 'My Favorites', 'My first playlist on Mouna Ragam']
    );

    const token = jwt.sign(
      { id: userId, email: email.toLowerCase().trim(), name: name.trim() },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.status(201).json({
      success: true,
      message: 'Registration successful!',
      token,
      user: {
        id: userId,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        avatar_url: defaultAvatar
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
};

// Login existing user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password.' });
    }

    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar_url: user.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

// Get current user profile with summary stats
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const [users] = await pool.query('SELECT id, name, email, avatar_url, created_at FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const user = users[0];

    // Fetch stats
    const [[{ liked_count }]] = await pool.query('SELECT COUNT(*) as liked_count FROM liked_songs WHERE user_id = ?', [userId]);
    const [[{ playlist_count }]] = await pool.query('SELECT COUNT(*) as playlist_count FROM playlists WHERE user_id = ?', [userId]);
    const [[{ recent_count }]] = await pool.query('SELECT COUNT(*) as recent_count FROM recently_played WHERE user_id = ?', [userId]);

    return res.json({
      success: true,
      user: {
        ...user,
        stats: {
          likedSongs: liked_count || 0,
          playlists: playlist_count || 0,
          recentlyPlayed: recent_count || 0
        }
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving profile.' });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, avatar_url } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Name is required.' });
    }

    await pool.query(
      'UPDATE users SET name = ?, avatar_url = ? WHERE id = ?',
      [name.trim(), avatar_url || null, userId]
    );

    const [updated] = await pool.query('SELECT id, name, email, avatar_url FROM users WHERE id = ?', [userId]);

    return res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: updated[0]
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ success: false, message: 'Server error updating profile.' });
  }
};
