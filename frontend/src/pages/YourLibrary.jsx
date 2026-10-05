import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Heart, Music, Disc, Radio, Clock, Play } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMusicData } from '../context/MusicDataContext';
import { songService, likedService } from '../services/api';
import SongRow from '../components/SongRow';
import SongCard from '../components/SongCard';
import AlbumCard from '../components/AlbumCard';

const YourLibrary = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { userPlaylists, openCreatePlaylistModal } = useMusicData();

  const [activeTab, setActiveTab] = useState('playlists'); // 'playlists' | 'liked' | 'recent' | 'albums'
  const [likedSongs, setLikedSongs] = useState([]);
  const [recentSongs, setRecentSongs] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchLibraryData = async () => {
      setLoading(true);
      try {
        const [likedRes, recentRes, albumsRes] = await Promise.all([
          likedService.getLikedSongs().catch(() => ({ data: { songs: [] } })),
          songService.getRecentlyPlayed().catch(() => ({ data: { recent: [] } })),
          songService.getAlbums().catch(() => ({ data: { albums: [] } }))
        ]);

        if (likedRes.data?.success) setLikedSongs(likedRes.data.songs || []);
        if (recentRes.data?.success) setRecentSongs(recentRes.data.recent || []);
        if (albumsRes.data?.success) setAlbums(albumsRes.data.albums || []);
      } catch (err) {
        console.error('Error fetching library data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLibraryData();
  }, [isAuthenticated, activeTab]);

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-center px-4 max-w-md mx-auto space-y-5">
        <div className="w-16 h-16 rounded-full bg-[#282828] flex items-center justify-center text-[#1db954]">
          <Music className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Enjoy your Library</h2>
          <p className="text-sm text-[#a0a0a0]">
            Log in to see your liked songs, playlists, recently played tracks, and saved albums.
          </p>
        </div>
        <button
          onClick={() => navigate('/login')}
          className="bg-white text-black font-bold text-sm px-8 py-3 rounded-full hover:scale-105 active:scale-95 transition-all shadow-xl"
        >
          Log in
        </button>
      </div>
    );
  }

  return (
    <div className="pb-16 px-6 pt-4 max-w-7xl mx-auto space-y-6">
      {/* Top Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#282828] pb-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'playlists', label: 'Playlists' },
            { id: 'liked', label: `Liked Songs (${likedSongs.length})` },
            { id: 'recent', label: 'Recently Played' },
            { id: 'albums', label: 'Albums' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white text-black'
                  : 'bg-[#242424] text-white hover:bg-[#333333]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => openCreatePlaylistModal()}
          className="flex items-center gap-2 bg-[#1db954] hover:bg-[#1ed760] text-black font-bold text-xs px-4 py-2 rounded-full transition-all hover:scale-105 active:scale-95 shadow-md self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create Playlist
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'playlists' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {/* Liked Songs Special Card */}
            <div
              onClick={() => navigate('/liked')}
              className="group relative bg-gradient-to-br from-[#450af5] to-[#8e8ee5] p-5 rounded-xl transition-all duration-300 cursor-pointer flex flex-col justify-end shadow-md hover:shadow-card-hover min-h-[220px]"
            >
              <div className="mb-4">
                <Heart className="w-8 h-8 fill-white text-white" />
              </div>
              <h3 className="font-bold text-xl text-white mb-1">
                Liked Songs
              </h3>
              <p className="text-xs text-white/80 font-medium">
                {likedSongs.length} songs
              </p>
            </div>

            {/* User's Playlists */}
            {userPlaylists.map((pl) => (
              <div
                key={pl.id}
                onClick={() => navigate(`/playlist/${pl.id}`)}
                className="group relative bg-[#181818] hover:bg-[#282828] p-4 rounded-xl transition-all duration-300 cursor-pointer flex flex-col shadow-md hover:shadow-card-hover"
              >
                <div className="relative w-full aspect-square mb-3.5 rounded-lg overflow-hidden bg-[#242424]">
                  <img
                    src={pl.cover_image || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80'}
                    alt={pl.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute right-2 bottom-2 w-10 h-10 rounded-full bg-[#1db954] text-black flex items-center justify-center shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all">
                    <Play className="w-4 h-4 fill-black ml-0.5" />
                  </div>
                </div>

                <h4 className="font-semibold text-sm text-white truncate mb-1">
                  {pl.title}
                </h4>
                <p className="text-xs text-[#888888]">
                  Playlist • {pl.total_tracks || 0} songs
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'liked' && (
        <div className="space-y-4">
          {likedSongs.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <Heart className="w-12 h-12 text-[#444444] mx-auto" />
              <h3 className="text-lg font-bold text-white">No liked songs yet</h3>
              <p className="text-xs text-[#888888]">
                Songs you like will appear here for easy listening.
              </p>
            </div>
          ) : (
            <div className="bg-[#181818]/60 rounded-xl p-2 divide-y divide-[#282828]">
              {likedSongs.map((song, idx) => (
                <SongRow
                  key={song.id}
                  song={song}
                  index={idx}
                  playlist={likedSongs}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'recent' && (
        <div className="space-y-4">
          {recentSongs.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <Radio className="w-12 h-12 text-[#444444] mx-auto" />
              <h3 className="text-lg font-bold text-white">No recently played songs</h3>
              <p className="text-xs text-[#888888]">
                Start playing songs to see your playback history.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {recentSongs.map((song) => (
                <SongCard key={`recent-grid-${song.id}`} song={song} playlist={recentSongs} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'albums' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {albums.map((album) => (
            <AlbumCard key={album.id} album={album} />
          ))}
        </div>
      )}
    </div>
  );
};

export default YourLibrary;
