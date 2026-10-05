import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Volume1,
  Shuffle, 
  Repeat, 
  Repeat1, 
  Heart,
  ListMusic,
  Loader2,
  Maximize2
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { useMusicData } from '../context/MusicDataContext';

const formatTime = (seconds) => {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

const BottomPlayer = () => {
  const {
    currentSong,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffle,
    repeatMode,
    togglePlay,
    nextSong,
    prevSong,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    queue
  } = usePlayer();

  const { isLiked, toggleLike, openAddToPlaylistModal } = useMusicData();
  const [showQueueDrawer, setShowQueueDrawer] = useState(false);

  if (!currentSong) {
    return (
      <footer className="h-20 bg-[#181818] border-t border-[#282828] flex items-center justify-between px-4 text-[#777777] text-sm select-none">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded bg-[#282828] flex items-center justify-center">
            <Play className="w-5 h-5 text-[#555555]" />
          </div>
          <div>
            <p className="text-white font-medium text-sm">Select a song to play</p>
            <p className="text-xs text-[#777777]">Explore albums, artists, or playlists</p>
          </div>
        </div>
        <div className="text-xs text-[#666666]">Mouna Ragam Player</div>
      </footer>
    );
  }

  const liked = isLiked(currentSong.id);
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const VolumeIcon = isMuted || volume === 0 
    ? VolumeX 
    : volume < 0.5 
    ? Volume1 
    : Volume2;

  return (
    <>
      <footer className="h-24 bg-[#181818] border-t border-[#282828] px-4 md:px-6 flex items-center justify-between select-none relative z-40 shadow-player">
        {/* Left: Track Information */}
        <div className="flex items-center gap-3 w-1/4 min-w-[180px]">
          <img
            src={currentSong.cover_image || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&auto=format&fit=crop&q=80'}
            alt={currentSong.title}
            className="w-14 h-14 rounded-md object-cover shadow-md flex-shrink-0"
          />
          <div className="min-w-0 pr-2">
            <h4 className="text-sm font-semibold text-white truncate hover:underline cursor-pointer">
              {currentSong.title}
            </h4>
            <p className="text-xs text-[#b3b3b3] truncate hover:underline cursor-pointer">
              {currentSong.artist_name || 'Unknown Artist'}
            </p>
          </div>

          <button
            onClick={() => toggleLike(currentSong)}
            className={`p-1.5 rounded-full transition-colors flex-shrink-0 ${
              liked ? 'text-[#1db954]' : 'text-[#b3b3b3] hover:text-white'
            }`}
            title={liked ? 'Remove from Liked Songs' : 'Save to Liked Songs'}
          >
            <Heart className={`w-4 h-4 ${liked ? 'fill-[#1db954]' : ''}`} />
          </button>
        </div>

        {/* Center: Playback Controls & Progress */}
        <div className="flex flex-col items-center max-w-xl w-2/4 px-4">
          <div className="flex items-center gap-5 mb-1.5">
            {/* Shuffle */}
            <button
              onClick={toggleShuffle}
              title={isShuffle ? 'Disable Shuffle' : 'Enable Shuffle'}
              className={`p-1 rounded-full transition-colors ${
                isShuffle ? 'text-[#1db954]' : 'text-[#b3b3b3] hover:text-white'
              }`}
            >
              <Shuffle className="w-4 h-4" />
            </button>

            {/* Previous */}
            <button
              onClick={prevSong}
              title="Previous Track"
              className="text-[#b3b3b3] hover:text-white transition-colors"
            >
              <SkipBack className="w-5 h-5 fill-current" />
            </button>

            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              title={isPlaying ? 'Pause' : 'Play'}
              disabled={isLoading}
              className="w-9 h-9 rounded-full bg-white text-black hover:scale-105 active:scale-95 transition-all flex items-center justify-center shadow-lg"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-black" />
              ) : isPlaying ? (
                <Pause className="w-5 h-5 fill-black text-black" />
              ) : (
                <Play className="w-5 h-5 fill-black text-black ml-0.5" />
              )}
            </button>

            {/* Next */}
            <button
              onClick={nextSong}
              title="Next Track"
              className="text-[#b3b3b3] hover:text-white transition-colors"
            >
              <SkipForward className="w-5 h-5 fill-current" />
            </button>

            {/* Repeat */}
            <button
              onClick={toggleRepeat}
              title={`Repeat: ${repeatMode}`}
              className={`p-1 rounded-full transition-colors ${
                repeatMode !== 'off' ? 'text-[#1db954]' : 'text-[#b3b3b3] hover:text-white'
              }`}
            >
              {repeatMode === 'one' ? (
                <Repeat1 className="w-4 h-4" />
              ) : (
                <Repeat className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Progress Slider */}
          <div className="flex items-center gap-2 w-full text-xs text-[#b3b3b3] font-medium group">
            <span className="w-10 text-right">{formatTime(currentTime)}</span>

            <div className="relative flex-1 flex items-center h-4">
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime || 0}
                onChange={(e) => seek(parseFloat(e.target.value))}
                className="w-full relative z-10 opacity-0 group-hover:opacity-100 cursor-pointer h-1"
              />
              <div className="absolute left-0 right-0 h-1 bg-[#4d4d4d] rounded-full overflow-hidden pointer-events-none">
                <div
                  className="h-full bg-white group-hover:bg-[#1db954] transition-colors rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <span className="w-10 text-left">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right: Volume & Queue Tools */}
        <div className="flex items-center justify-end gap-3 w-1/4 min-w-[180px]">
          {/* Queue Button */}
          <button
            onClick={() => setShowQueueDrawer(!showQueueDrawer)}
            title="Queue"
            className={`p-2 rounded-full transition-colors relative ${
              showQueueDrawer ? 'text-[#1db954] bg-[#282828]' : 'text-[#b3b3b3] hover:text-white'
            }`}
          >
            <ListMusic className="w-5 h-5" />
            {queue.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#1db954] text-black text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {queue.length}
              </span>
            )}
          </button>

          {/* Volume Control */}
          <div className="flex items-center gap-2 group w-32">
            <button
              onClick={toggleMute}
              className="text-[#b3b3b3] hover:text-white transition-colors"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              <VolumeIcon className="w-5 h-5" />
            </button>
            <div className="relative flex-1 flex items-center h-4">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-full relative z-10 cursor-pointer h-1 accent-[#1db954]"
              />
            </div>
          </div>
        </div>
      </footer>

      {/* Queue Drawer Popover */}
      {showQueueDrawer && (
        <div className="fixed bottom-24 right-4 w-80 max-h-96 bg-[#282828] border border-[#3e3e3e] rounded-xl shadow-2xl p-4 z-50 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-[#3e3e3e] mb-2">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <ListMusic className="w-4 h-4 text-[#1db954]" />
              Playback Queue ({queue.length})
            </h3>
            <button
              onClick={() => setShowQueueDrawer(false)}
              className="text-xs text-[#b3b3b3] hover:text-white"
            >
              Close
            </button>
          </div>

          <div className="overflow-y-auto flex-1 space-y-1 pr-1">
            {queue.length === 0 ? (
              <p className="text-xs text-[#777777] text-center py-6">Queue is empty</p>
            ) : (
              queue.map((song, idx) => {
                const isCurrent = song.id === currentSong?.id;
                return (
                  <div
                    key={`${song.id}-${idx}`}
                    className={`flex items-center gap-3 p-2 rounded-lg text-xs transition-colors ${
                      isCurrent ? 'bg-[#333333] text-[#1db954] font-medium' : 'text-white hover:bg-[#333333]/50'
                    }`}
                  >
                    <img
                      src={song.cover_image}
                      alt={song.title}
                      className="w-8 h-8 rounded object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{song.title}</p>
                      <p className="text-[#999999] truncate text-[11px]">{song.artist_name}</p>
                    </div>
                    {isCurrent && (
                      <span className="text-[10px] text-[#1db954] px-1.5 py-0.5 bg-[#1db954]/10 rounded">
                        Playing
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default BottomPlayer;
