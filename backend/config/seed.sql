-- Seed Data for Mouna Ragam Music Streaming App
USE mouna_ragam_db;

-- 1. Insert Artists
INSERT INTO artists (id, name, bio, image_url, monthly_listeners) VALUES
(1, 'A.R. Rahman', 'Legendary Indian composer, singer, and music producer known for timeless melodies and symphonic brilliance.', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80', 8500000),
(2, 'Ilaiyaraaja', 'The Maestro of Indian music, celebrated for blending Western classical harmony with traditional melodies.', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80', 7200000),
(3, 'Anirudh Ravichander', 'Contemporary hitmaker and electronic music composer reigning across modern soundtrack charts.', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&auto=format&fit=crop&q=80', 9800000),
(4, 'Sid Sriram', 'Acclaimed Carnatic and playback vocalist known for soulful vocal textures and acoustic depth.', 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&auto=format&fit=crop&q=80', 5400000),
(5, 'Harris Jayaraj', 'Master of smooth rhythm, guitar riffs, and modern romantic melodies with acoustic warmth.', 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=80', 4900000)
ON DUPLICATE KEY UPDATE name=VALUES(name), bio=VALUES(bio), image_url=VALUES(image_url), monthly_listeners=VALUES(monthly_listeners);

-- 2. Insert Albums
INSERT INTO albums (id, title, artist_id, cover_image, release_year, genre) VALUES
(1, 'Mouna Ragam Classics', 2, 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&auto=format&fit=crop&q=80', 1986, 'Romantic Melody'),
(2, 'Roja & Beyond', 1, 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&auto=format&fit=crop&q=80', 1992, 'World Fusion'),
(3, 'Midnight Serenade', 4, 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500&auto=format&fit=crop&q=80', 2023, 'Acoustic Soul'),
(4, 'Neon Vibes', 3, 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=500&auto=format&fit=crop&q=80', 2024, 'Electro Pop'),
(5, 'Minnale Memories', 5, 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=500&auto=format&fit=crop&q=80', 2001, 'Romantic Harmony')
ON DUPLICATE KEY UPDATE title=VALUES(title), cover_image=VALUES(cover_image), release_year=VALUES(release_year), genre=VALUES(genre);

-- 3. Insert Songs (Royalty-free high quality audio tracks for seamless streaming)
INSERT INTO songs (id, title, artist_id, album_id, duration, audio_url, cover_image, genre, plays_count) VALUES
(1, 'Mandram Vandha Thendralukku', 2, 1, 234, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&auto=format&fit=crop&q=80', 'Melody', 142500),
(2, 'Chinna Chinna Vanna Kuyil', 2, 1, 218, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500&auto=format&fit=crop&q=80', 'Melody', 98000),
(3, 'Pudhu Vellai Mazhai', 1, 2, 252, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&auto=format&fit=crop&q=80', 'Fusion', 220000),
(4, 'Chinna Chinna Aasai', 1, 2, 290, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=80', 'Folk Fusion', 185000),
(5, 'Maruvaarthai Pesadhe', 4, 3, 275, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&auto=format&fit=crop&q=80', 'Soulful', 310000),
(6, 'Kadhaippoma', 4, 3, 240, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80', 'Acoustic', 145000),
(7, 'Hukum - Alappara Theme', 3, 4, 210, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3', 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=500&auto=format&fit=crop&q=80', 'Electro Pop', 540000),
(8, 'Arabic Kuthu Beats', 3, 4, 195, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&auto=format&fit=crop&q=80', 'Dance', 480000),
(9, 'Vaseegara Breeze', 5, 5, 260, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3', 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=500&auto=format&fit=crop&q=80', 'Romantic', 290000),
(10, 'Venmathi Venmathiye', 5, 5, 280, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80', 'Melody', 340000)
ON DUPLICATE KEY UPDATE title=VALUES(title), duration=VALUES(duration), audio_url=VALUES(audio_url), cover_image=VALUES(cover_image), genre=VALUES(genre), plays_count=VALUES(plays_count);
