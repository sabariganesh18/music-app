import React, { useState } from 'react';
import { Play, Pause, Heart, MoreHorizontal, Plus, Trash2, Music } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { useMusicData } from '../context/MusicDataContext';
import { Link } from 'react-router-dom';

const formatTime = (seconds) => {
  if (isNaN(seconds) || seconds < 0) return '3:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

const SongRow = ({ 
  song, 
  index, 
  playlist = [], 
  showAlbum = true, 
  showDateAdded = false, 
  onRemove = null,
  playlistId = null 
}) => {
  const { currentSong, isPlaying, playSong, togglePlay } = usePlayer();
  const { isLiked, toggleLike, openAddToPlaylistModal } = useMusicData();
  const [showMenu, setShowMenu] = useState(false);

  const isCurrent = currentSong?.id === song.id;
  const isRowPlaying = isCurrent && isPlaying;
  const liked = isLiked(song.id);

  const handlePlayClick = () => {
    if (isCurrent) {
      togglePlay();
    } else {
      playSong(song, playlist.length > 0 ? playlist : [song]);
    }
  };

  return (
    <div className={`group grid grid-cols-12 items-center px-4 py-2.5 rounded-md hover:bg-[#282828] text-sm text-[#b3b3b3] transition-colors relative ${
      isCurrent ? 'bg-[#1f1f1f]' : ''
    }`}>
      {/* 1. Track Index & Play Hover */}
      <div className="col-span-1 flex items-center justify-start w-8">
        <div className="relative w-6 h-6 flex items-center justify-center">
          <span className={`group-hover:hidden text-sm font-medium ${isCurrent ? 'text-[#1db954]' : 'text-[#888888]'}`}>
            {isRowPlaying ? (
              <span className="flex items-end gap-[2px] h-3.5">
                <span className="w-1 bg-[#1db954] h-full animate-pulse" />
                <span className="w-1 bg-[#1db954] h-2/3 animate-pulse delay-75" />
                <span className="w-1 bg-[#1db954] h-4/5 animate-pulse delay-150" />
              </span>
            ) : (
              index !== undefined ? index + 1 : <Music className="w-4 h-4 text-[#888888]" />
            )}
          </span>

          <button
            onClick={handlePlayClick}
            className="hidden group-hover:flex items-center justify-center text-white"
          >
            {isRowPlaying ? (
              <Pause className="w-4 h-4 fill-white" />
            ) : (
              <Play className="w-4 h-4 fill-white" />
            )}
          </button>
        </div>
      </div>

      {/* 2. Title & Artist Info */}
      <div className={`flex items-center gap-3 min-w-0 pr-4 ${showAlbum ? 'col-span-5' : 'col-span-8'}`}>
        <img
          src={song.cover_image || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&auto=format&fit=crop&q=80'}
          alt={song.title}
          className="w-10 h-10 rounded object-cover flex-shrink-0"
        />
        <div className="min-w-0">
          <h4 className={`truncate font-medium text-sm hover:underline cursor-pointer ${
            isCurrent ? 'text-[#1db954]' : 'text-white'
          }`}
          onClick={handlePlayClick}
          >
            {song.title}
          </h4>
          <p className="text-xs text-[#a0a0a0] truncate hover:text-white">
            {song.artist_name || 'Unknown Artist'}
          </p>
        </div>
      </div>

      {/* 3. Album */}
      {showAlbum && (
        <div className="col-span-3 text-xs text-[#a0a0a0] truncate hover:text-white pr-4">
          {song.album_title ? (
            <Link to={`/album/${song.album_id}`} className="hover:underline">
              {song.album_title}
            </Link>
          ) : (
            'Single'
          )}
        </div>
      )}

      {/* 4. Action buttons & Duration */}
      <div className={`${showAlbum ? 'col-span-3' : 'col-span-3'} flex items-center justify-end gap-3 pr-2`}>
        {/* Like Button */}
        <button
          onClick={() => toggleLike(song)}
          title={liked ? 'Unlike' : 'Like'}
          className={`p-1.5 rounded-full transition-colors ${
            liked ? 'text-[#1db954]' : 'opacity-0 group-hover:opacity-100 text-[#b3b3b3] hover:text-white'
          }`}
        >
          <Heart className={`w-4 h-4 ${liked ? 'fill-[#1db954]' : ''}`} />
        </button>

        {/* Duration */}
        <span className="text-xs text-[#a0a0a0] w-10 text-right">
          {formatTime(song.duration)}
        </span>

        {/* More Actions Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            title="More Options"
            className="p-1 rounded-full opacity-0 group-hover:opacity-100 text-[#b3b3b3] hover:text-white transition-opacity"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {showMenu && (
            <div 
              className="absolute right-0 top-6 w-44 bg-[#282828] border border-[#3e3e3e] rounded-lg shadow-2xl py-1 z-50 text-xs text-white"
              onMouseLeave={() => setShowMenu(false)}
            >
              <button
                onClick={() => {
                  setShowMenu(false);
                  openAddToPlaylistModal(song);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#383838] transition-colors text-left"
              >
                <Plus className="w-3.5 h-3.5 text-[#1db954]" />
                <span>Add to Playlist</span>
              </button>

              {onRemove && (
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onRemove(song.id);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#383838] transition-colors text-left text-[#ff5c5c]"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove from playlist</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SongRow;
