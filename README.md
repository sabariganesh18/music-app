# 🎵 Mouna Ragam - Music Streaming Web Application

A Spotify-inspired, clean, ad-free modern music streaming web application built with **React.js, Vite, Tailwind CSS, Node.js, Express, MySQL, and JWT Authentication**.

---

## 🌟 Key Features

- **Ad-Free Experience**: Pure music enjoyment with zero advertisements, banners, or interruptions.
- **HTML5 Audio Engine**:
  - Full playback controls (Play/Pause, Next/Previous, Seekable Progress Bar, Volume & Mute toggle).
  - Shuffle and Repeat modes (Off / Repeat All / Repeat One).
  - Live playback queue preview drawer.
- **Home Hub**:
  - Time-aware greeting (*Good morning / afternoon / evening*).
  - Quick-access shortcuts.
  - Popular Songs, Popular Artists, and Recommended Albums.
  - Recently Played history synced to user profile.
- **Smart Search**:
  - Real-time search across songs, artists, albums, and genres.
  - Category filters (*All, Songs, Artists, Albums*).
  - Clean "No results found" feedback and genre exploration cards.
- **Playlist Management**:
  - Create, Rename, and Delete custom playlists.
  - Add / Remove songs with 1-click modal.
  - Play entire playlists continuously.
- **Liked Songs**:
  - Fast 1-click heart toggle on cards, table rows, and the player bar.
  - Persisted in MySQL database.
- **Artist & Album Discographies**:
  - Dedicated pages for artists and albums with verified badges and tracklists.
- **Authentication & Profiles**:
  - JWT-based registration and login with bcrypt password hashing.
  - Interactive profile page with activity stats counters.
  - 1-Click Demo Login support for instant testing.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons, Axios, React Router 6 |
| **Backend** | Node.js, Express.js, JWT (`jsonwebtoken`), `bcryptjs`, CORS |
| **Database** | MySQL 8.0 (`mysql2/promise`) with automatic schema initialization |
| **Audio** | HTML5 Audio API with royalty-free tracks |

---

## 🗄️ Database Architecture

The application uses MySQL with the following normalized tables:

```sql
- users (id, name, email, password, avatar_url, created_at)
- artists (id, name, bio, image_url, monthly_listeners, created_at)
- albums (id, title, artist_id, cover_image, release_year, genre, created_at)
- songs (id, title, artist_id, album_id, duration, audio_url, cover_image, genre, plays_count, created_at)
- playlists (id, user_id, title, description, cover_image, is_public, created_at, updated_at)
- playlist_songs (id, playlist_id, song_id, added_at)
- liked_songs (id, user_id, song_id, liked_at)
- recently_played (id, user_id, song_id, played_at)
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18+ recommended)
- **MySQL Server 8.0+** running locally

### 2. Configure Backend Environment
Navigate to `backend/` and verify `.env`:
```env
PORT=5000
CLIENT_URL=http://localhost:5173
JWT_SECRET=mouna_ragam_super_secure_jwt_secret_key_2026
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=mouna_ragam_db
DB_PORT=3306
```

### 3. Initialize Database & Seed Data
Run the automated initialization script from the `backend/` directory:
```bash
cd backend
npm install
npm run db:init
```
*This automatically creates the database, tables, seed artists, albums, 10+ songs, and a demo account.*

---

## 💻 Running the Application

### Start Backend Server
```bash
cd backend
npm run dev
# Server will run on http://localhost:5000
```

### Start Frontend Application
```bash
cd frontend
npm install
npm run dev
# Web application will open on http://localhost:5173
```

---

## 👤 Demo Credentials

For quick evaluation, you can use the pre-seeded demo user:
- **Email:** `demo@mounaragam.com`
- **Password:** `password123`
*(Or click the "Quick Demo Login (1-Click Fill)" button on the Login page)*

---

## 🧪 Running Automated Tests

Run the complete 17-point integration test suite:
```bash
cd backend
node test-integration.js
```

---

## 📦 Deployment Instructions

### Frontend Build
```bash
cd frontend
npm run build
```
The optimized production bundle is generated in `frontend/dist/`.

### Production Server
In production, you can serve the frontend bundle using Express static middleware or deploy the frontend to Vercel/Netlify and the backend to any Node/Docker host (e.g. Render, Railway, AWS ECS).
