import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Pause, Edit3, Trash2, Clock, Plus, Search as SearchIcon, Music } from 'lucide-react';
import { playlistService, songService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { usePlayer } from '../context/PlayerContext';
import { useMusicData } from '../context/MusicDataContext';
import SongRow from '../components/SongRow';

const formatDuration = (songs) => {
  const totalSeconds = songs.reduce((acc, s) => acc + (s.duration || 0), 0);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins} min ${secs > 0 ? `${secs} sec` : ''}`;
};

const PlaylistView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentSong, isPlaying, playQueue, togglePlay } = usePlayer();
  const {
    openCreatePlaylistModal,
    deletePlaylist,
    removeSongFromPlaylist,
    addSongToPlaylist,
    userPlaylists
  } = useMusicData();

  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchSongQuery, setSearchSongQuery] = useState('');
  const [availableSongs, setAvailableSongs] = useState([]);

  const fetchPlaylist = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await playlistService.getPlaylistById(id);
      if (res.data.success) {
        setPlaylist(res.data.playlist);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load playlist.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaylist();
  }, [id, userPlaylists]);

  // Load all songs for "Add to playlist" search section
  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const res = await songService.getSongs();
        if (res.data.success) {
          setAvailableSongs(res.data.songs || []);
        }
      } catch (err) {
        console.error('Error fetching songs for playlist add:', err);
      }
    };
    fetchSongs();
  }, []);

  if (loading) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="flex gap-6 items-end">
          <div className="w-48 h-48 bg-[#282828] rounded-xl" />
          <div className="space-y-3 flex-1">
            <div className="h-4 w-24 bg-[#282828] rounded" />
            <div className="h-10 w-72 bg-[#282828] rounded" />
            <div className="h-4 w-48 bg-[#282828] rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !playlist) {
    return (
      <div className="p-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Playlist not found</h2>
        <p className="text-sm text-[#a0a0a0]">{error || 'This playlist may have been deleted.'}</p>
        <button
          onClick={() => navigate('/library')}
          className="bg-white text-black font-semibold text-xs px-6 py-2.5 rounded-full"
        >
          Back to Library
        </button>
      </div>
    );
  }

  const isOwner = playlist.is_owner || (user && user.id === playlist.user_id);
  const songs = playlist.songs || [];
  const isPlaylistPlaying = songs.length > 0 && songs.some(s => s.id === currentSong?.id) && isPlaying;

  const handlePlayAll = () => {
    if (songs.length === 0) return;
    if (isPlaylistPlaying) {
      togglePlay();
    } else {
      playQueue(songs, 0);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${playlist.title}"?`)) {
      const ok = await deletePlaylist(playlist.id);
      if (ok) {
        navigate('/library');
      }
    }
  };

  const handleRemoveSong = async (songId) => {
    await removeSongFromPlaylist(playlist.id, songId);
    fetchPlaylist();
  };

  const handleAddSong = async (songId) => {
    await addSongToPlaylist(playlist.id, songId);
    fetchPlaylist();
  };

  // Filter songs for adding
  const filteredSuggestions = availableSongs.filter(s => {
    const notInPlaylist = !songs.some(ps => ps.id === s.id);
    if (!searchSongQuery) return notInPlaylist;
    const q = searchSongQuery.toLowerCase();
    return notInPlaylist && (s.title.toLowerCase().includes(q) || (s.artist_name && s.artist_name.toLowerCase().includes(q)));
  });

  return (
    <div className="pb-24 max-w-7xl mx-auto">
      {/* 1. Playlist Banner Header */}
      <div className="bg-gradient-to-b from-[#333333] to-[#121212] p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-end gap-6">
        <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-xl overflow-hidden bg-[#181818] shadow-2xl flex-shrink-0 border border-[#3e3e3e]/40">
          <img
            src={playlist.cover_image || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80'}
            alt={playlist.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 min-w-0 text-center sm:text-left">
          <span className="text-xs font-bold uppercase tracking-wider text-white">
            Playlist
          </span>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white mt-1 mb-2 tracking-tight">
            {playlist.title}
          </h1>
          {playlist.description && (
            <p className="text-sm text-[#b3b3b3] mb-3 line-clamp-2">
              {playlist.description}
            </p>
          )}

          <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-[#b3b3b3] font-medium">
            <span className="text-white font-bold">{playlist.owner_name || user?.name}</span>
            <span>•</span>
            <span>{songs.length} {songs.length === 1 ? 'song' : 'songs'}</span>
            {songs.length > 0 && (
              <>
                <span>•</span>
                <span>{formatDuration(songs)}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 2. Action Controls Bar */}
      <div className="px-6 sm:px-8 py-4 flex items-center gap-5">
        <button
          onClick={handlePlayAll}
          disabled={songs.length === 0}
          className={`w-14 h-14 rounded-full bg-[#1db954] hover:bg-[#1ed760] text-black flex items-center justify-center shadow-2xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
          title="Play Playlist"
        >
          {isPlaylistPlaying ? (
            <Pause className="w-6 h-6 fill-black text-black" />
          ) : (
            <Play className="w-6 h-6 fill-black text-black ml-1" />
          )}
        </button>

        {isOwner && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => openCreatePlaylistModal(playlist)}
              title="Edit playlist"
              className="p-2.5 rounded-full hover:bg-[#282828] text-[#b3b3b3] hover:text-white transition-colors"
            >
              <Edit3 className="w-5 h-5" />
            </button>
            <button
              onClick={handleDelete}
              title="Delete playlist"
              className="p-2.5 rounded-full hover:bg-[#282828] text-[#ff5c5c] hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* 3. Songs Table Header */}
      <div className="px-6 sm:px-8 mt-4">
        {songs.length > 0 && (
          <div className="grid grid-cols-12 px-4 py-2 text-xs font-semibold text-[#888888] uppercase tracking-wider border-b border-[#282828] mb-2">
            <span className="col-span-1">#</span>
            <span className="col-span-5">Title</span>
            <span className="col-span-3">Album</span>
            <span className="col-span-3 text-right pr-6 flex items-center justify-end gap-1">
              <Clock className="w-3.5 h-3.5" />
            </span>
          </div>
        )}

        {/* Songs List */}
        <div className="space-y-1">
          {songs.length === 0 ? (
            <div className="py-12 text-center text-sm text-[#888888] space-y-2">
              <Music className="w-10 h-10 mx-auto opacity-50" />
              <p>This playlist is empty.</p>
              <p className="text-xs">Add recommended songs below!</p>
            </div>
          ) : (
            songs.map((song, idx) => (
              <SongRow
                key={`${song.id}-${idx}`}
                song={song}
                index={idx}
                playlist={songs}
                onRemove={isOwner ? handleRemoveSong : null}
                playlistId={playlist.id}
              />
            ))
          )}
        </div>
      </div>

      {/* 4. Find more songs for this playlist */}
      {isOwner && (
        <div className="px-6 sm:px-8 mt-12 pt-8 border-t border-[#282828]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-lg font-bold text-white">
                Recommended Songs for this Playlist
              </h3>
              <p className="text-xs text-[#a0a0a0]">
                Search and add more tracks to enhance your vibe
              </p>
            </div>

            <div className="relative max-w-xs w-full">
              <SearchIcon className="w-4 h-4 text-[#888888] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchSongQuery}
                onChange={(e) => setSearchSongQuery(e.target.value)}
                placeholder="Search tracks..."
                className="w-full bg-[#242424] text-white text-xs pl-9 pr-3 py-2 rounded-full border border-transparent focus:border-white/30 focus:outline-none"
              />
            </div>
          </div>

          <div className="bg-[#181818]/60 rounded-xl p-3 divide-y divide-[#282828]">
            {filteredSuggestions.slice(0, 5).map((song) => (
              <div
                key={`suggest-${song.id}`}
                className="flex items-center justify-between py-2.5 px-3 hover:bg-[#282828] rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={song.cover_image}
                    alt={song.title}
                    className="w-9 h-9 rounded object-cover"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{song.title}</p>
                    <p className="text-xs text-[#a0a0a0] truncate">{song.artist_name}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleAddSong(song.id)}
                  className="flex items-center gap-1.5 border border-[#555555] hover:border-white text-white text-xs font-semibold px-4 py-1.5 rounded-full transition-colors flex-shrink-0 ml-4"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaylistView;
