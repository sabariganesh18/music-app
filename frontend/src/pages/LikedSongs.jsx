import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Play, Pause, Clock, Music } from 'lucide-react';
import { likedService } from '../services/api';
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

const LikedSongs = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { currentSong, isPlaying, playQueue, togglePlay } = usePlayer();
  const { likedSongIds } = useMusicData();

  const [likedSongs, setLikedSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    const fetchLiked = async () => {
      setLoading(true);
      try {
        const res = await likedService.getLikedSongs();
        if (res.data.success) {
          setLikedSongs(res.data.songs || []);
        }
      } catch (err) {
        console.error('Error fetching liked songs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLiked();
  }, [isAuthenticated, likedSongIds]);

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-center px-4 max-w-md mx-auto space-y-5">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#450af5] to-[#8e8ee5] flex items-center justify-center text-white shadow-xl">
          <Heart className="w-8 h-8 fill-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Songs you like live here</h2>
          <p className="text-sm text-[#a0a0a0]">
            Log in to save and enjoy your favorite tracks whenever you want.
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

  if (loading) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="flex gap-6 items-end">
          <div className="w-52 h-52 bg-[#282828] rounded-xl" />
          <div className="space-y-3 flex-1">
            <div className="h-4 w-20 bg-[#282828] rounded" />
            <div className="h-12 w-64 bg-[#282828] rounded" />
            <div className="h-4 w-40 bg-[#282828] rounded" />
          </div>
        </div>
      </div>
    );
  }

  const isLikedPlaying = likedSongs.length > 0 && likedSongs.some(s => s.id === currentSong?.id) && isPlaying;

  const handlePlayAll = () => {
    if (likedSongs.length === 0) return;
    if (isLikedPlaying) {
      togglePlay();
    } else {
      playQueue(likedSongs, 0);
    }
  };

  return (
    <div className="pb-24 max-w-7xl mx-auto">
      {/* 1. Gradient Header Banner */}
      <div className="bg-gradient-to-b from-[#450af5] via-[#241369] to-[#121212] p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-end gap-6 shadow-2xl">
        <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-xl bg-gradient-to-br from-[#450af5] to-[#8e8ee5] shadow-2xl flex items-center justify-center text-white flex-shrink-0">
          <Heart className="w-24 h-24 fill-white" />
        </div>

        <div className="flex-1 min-w-0 text-center sm:text-left">
          <span className="text-xs font-bold uppercase tracking-wider text-white">
            Playlist
          </span>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white mt-1 mb-3 tracking-tight">
            Liked Songs
          </h1>

          <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-white/90 font-medium">
            <span className="text-white font-bold">{user?.name}</span>
            <span>•</span>
            <span>{likedSongs.length} {likedSongs.length === 1 ? 'song' : 'songs'}</span>
            {likedSongs.length > 0 && (
              <>
                <span>•</span>
                <span>{formatDuration(likedSongs)}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 2. Action Controls Bar */}
      <div className="px-6 sm:px-8 py-5 flex items-center gap-5">
        <button
          onClick={handlePlayAll}
          disabled={likedSongs.length === 0}
          className={`w-14 h-14 rounded-full bg-[#1db954] hover:bg-[#1ed760] text-black flex items-center justify-center shadow-2xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
          title="Play Liked Songs"
        >
          {isLikedPlaying ? (
            <Pause className="w-6 h-6 fill-black text-black" />
          ) : (
            <Play className="w-6 h-6 fill-black text-black ml-1" />
          )}
        </button>
      </div>

      {/* 3. Table Header & Songs */}
      <div className="px-6 sm:px-8 mt-2">
        {likedSongs.length > 0 ? (
          <>
            <div className="grid grid-cols-12 px-4 py-2 text-xs font-semibold text-[#888888] uppercase tracking-wider border-b border-[#282828] mb-2">
              <span className="col-span-1">#</span>
              <span className="col-span-5">Title</span>
              <span className="col-span-3">Album</span>
              <span className="col-span-3 text-right pr-6 flex items-center justify-end gap-1">
                <Clock className="w-3.5 h-3.5" />
              </span>
            </div>

            <div className="space-y-1">
              {likedSongs.map((song, idx) => (
                <SongRow
                  key={`liked-${song.id}`}
                  song={song}
                  index={idx}
                  playlist={likedSongs}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="py-20 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#242424] flex items-center justify-center text-[#888888] mx-auto">
              <Heart className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">No liked songs yet</h3>
            <p className="text-xs text-[#a0a0a0] max-w-sm mx-auto">
              Tap the heart icon on any track to save it here for fast playback.
            </p>
            <button
              onClick={() => navigate('/search')}
              className="bg-white text-black font-semibold text-xs px-6 py-2.5 rounded-full hover:scale-105 transition-transform"
            >
              Find songs
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LikedSongs;
