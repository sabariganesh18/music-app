const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function initializeDatabase() {
  console.log('🔄 Initializing Mouna Ragam MySQL Database...');

  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    multipleStatements: true
  };

  try {
    // 1. Connect without db to create database if needed
    const rootConnection = await mysql.createConnection(dbConfig);
    const dbName = process.env.DB_NAME || 'mouna_ragam_db';
    await rootConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await rootConnection.end();

    // 2. Connect directly to target database
    const connection = await mysql.createConnection({
      ...dbConfig,
      database: dbName
    });

    // 3. Read and execute schema
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await connection.query(schemaSql);
    console.log('✅ Schema created successfully.');

    // 4. Read and execute seed data
    const seedSql = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');
    await connection.query(seedSql);
    console.log('✅ Base seed data (artists, albums, songs) inserted successfully.');

    // 5. Seed default demo user and demo playlist if not exists
    const hashedPassword = await bcrypt.hash('password123', 10);
    const [existingUsers] = await connection.query('SELECT id FROM users WHERE email = ?', ['demo@mounaragam.com']);
    
    let demoUserId;
    if (existingUsers.length === 0) {
      const [userResult] = await connection.query(
        'INSERT INTO users (name, email, password, avatar_url) VALUES (?, ?, ?, ?)',
        [
          'Melody Lover',
          'demo@mounaragam.com',
          hashedPassword,
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
        ]
      );
      demoUserId = userResult.insertId;
      console.log('✅ Demo user created: demo@mounaragam.com (password: password123)');

      // Create a default playlist for demo user
      const [playlistResult] = await connection.query(
        'INSERT INTO playlists (user_id, title, description, cover_image) VALUES (?, ?, ?, ?)',
        [
          demoUserId,
          'Late Night Melodies',
          'A handpicked selection of peaceful tunes to unwind and relax.',
          'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80'
        ]
      );

      const playlistId = playlistResult.insertId;
      await connection.query(
        'INSERT INTO playlist_songs (playlist_id, song_id) VALUES (?, ?), (?, ?), (?, ?)',
        [playlistId, 1, playlistId, 2, playlistId, 5]
      );

      // Add a couple of liked songs for demo user
      await connection.query(
        'INSERT INTO liked_songs (user_id, song_id) VALUES (?, ?), (?, ?)',
        [demoUserId, 1, demoUserId, 3]
      );
      console.log('✅ Demo playlist and liked songs created.');
    } else {
      demoUserId = existingUsers[0].id;
    }

    await connection.end();
    console.log('🎉 Database initialization complete!');
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  initializeDatabase();
}

module.exports = initializeDatabase;
