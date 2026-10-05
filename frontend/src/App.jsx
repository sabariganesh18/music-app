import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PlayerProvider } from './context/PlayerContext';
import { MusicDataProvider } from './context/MusicDataContext';

import Sidebar from './components/Sidebar';
import Header from './components/Header';
import BottomPlayer from './components/BottomPlayer';
import PlaylistModal from './components/PlaylistModal';
import AddToPlaylistModal from './components/AddToPlaylistModal';
import Toast from './components/Toast';

import Home from './pages/Home';
import Search from './pages/Search';
import YourLibrary from './pages/YourLibrary';
import PlaylistView from './pages/PlaylistView';
import LikedSongs from './pages/LikedSongs';
import AlbumView from './pages/AlbumView';
import ArtistView from './pages/ArtistView';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';

function AppContent() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="flex h-screen w-screen bg-[#000000] text-white overflow-hidden select-none">
      {/* 1. Left Sidebar */}
      <Sidebar />

      {/* 2. Main Content View Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#121212] m-2 ml-0 rounded-xl overflow-hidden shadow-2xl relative">
        <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search searchQuery={searchQuery} setSearchQuery={setSearchQuery} />} />
            <Route path="/library" element={<YourLibrary />} />
            <Route path="/playlist/:id" element={<PlaylistView />} />
            <Route path="/liked" element={<LikedSongs />} />
            <Route path="/album/:id" element={<AlbumView />} />
            <Route path="/artist/:id" element={<ArtistView />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* 3. Global Modals & Notifications */}
        <PlaylistModal />
        <AddToPlaylistModal />
        <Toast />
      </div>

      {/* 4. Bottom Persistent Music Player */}
      <div className="fixed bottom-0 left-0 right-0 z-40">
        <BottomPlayer />
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PlayerProvider>
          <MusicDataProvider>
            <AppContent />
          </MusicDataProvider>
        </PlayerProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
