import React from 'react';
import { Play, Pause } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

const SongCard = ({ song, playlist = [] }) => {
  const { currentSong, isPlaying, playSong, togglePlay } = usePlayer();

  const isCurrent = currentSong?.id === song.id;
  const isCardPlaying = isCurrent && isPlaying;

  const handlePlayClick = (e) => {
    e.stopPropagation();
    if (isCurrent) {
      togglePlay();
    } else {
      playSong(song, playlist.length > 0 ? playlist : [song]);
    }
  };

  return (
    <div
      onClick={handlePlayClick}
      className="group relative bg-[#181818] hover:bg-[#282828] p-4 rounded-xl transition-all duration-300 cursor-pointer flex flex-col shadow-md hover:shadow-card-hover"
    >
      {/* Cover Artwork & Hover Play Button */}
      <div className="relative w-full aspect-square mb-3.5 rounded-lg overflow-hidden bg-[#242424]">
        <img
          src={song.cover_image || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80'}
          alt={song.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Floating Green Play Button */}
        <button
          onClick={handlePlayClick}
          aria-label={isCardPlaying ? 'Pause song' : 'Play song'}
          className={`absolute right-2 bottom-2 w-11 h-11 rounded-full bg-[#1db954] text-black flex items-center justify-center shadow-2xl transition-all duration-300 transform ${
            isCardPlaying
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-105'
          }`}
        >
          {isCardPlaying ? (
            <Pause className="w-5 h-5 fill-black" />
          ) : (
            <Play className="w-5 h-5 fill-black ml-0.5" />
          )}
        </button>
      </div>

      {/* Song Info */}
      <div className="flex flex-col flex-1 min-w-0">
        <h3 className={`font-semibold text-sm truncate leading-snug mb-1 ${
          isCurrent ? 'text-[#1db954]' : 'text-white'
        }`}>
          {song.title}
        </h3>
        <p className="text-xs text-[#a0a0a0] truncate">
          {song.artist_name || 'Various Artists'}
        </p>
      </div>
    </div>
  );
};

export default SongCard;
