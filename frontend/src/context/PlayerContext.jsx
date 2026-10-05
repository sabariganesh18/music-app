import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { songService } from '../services/api';

const PlayerContext = createContext(null);

export const PlayerProvider = ({ children }) => {
  const audioRef = useRef(new Audio());
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('mouna_volume');
    return saved !== null ? parseFloat(saved) : 0.8;
  });
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState('off'); // 'off' | 'all' | 'one'
  const [queue, setQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize audio element settings & listeners
  useEffect(() => {
    const audio = audioRef.current;
    audio.volume = isMuted ? 0 : volume;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
      setIsLoading(false);
    };

    const handleWaiting = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handlePlaying = () => {
      setIsPlaying(true);
      setIsLoading(false);
    };
    const handlePause = () => setIsPlaying(false);

    const handleEnded = () => {
      handleSongEnd();
    };

    const handleError = (e) => {
      console.warn('Audio playback issue encountered:', e);
      setIsLoading(false);
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.pause();
    };
  }, [queue, queueIndex, isShuffle, repeatMode, volume, isMuted]);

  // Handle song ending based on repeat & shuffle settings
  const handleSongEnd = () => {
    if (repeatMode === 'one') {
      const audio = audioRef.current;
      audio.currentTime = 0;
      audio.play().catch(console.error);
      return;
    }

    if (queue.length === 0) {
      setIsPlaying(false);
      return;
    }

    if (isShuffle) {
      const nextIdx = Math.floor(Math.random() * queue.length);
      playSongAtIndex(nextIdx);
      return;
    }

    if (queueIndex < queue.length - 1) {
      playSongAtIndex(queueIndex + 1);
    } else if (repeatMode === 'all') {
      playSongAtIndex(0);
    } else {
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };

  // Play a specific song and optionally replace the queue
  const playSong = async (song, newQueue = null) => {
    if (!song) return;

    const audio = audioRef.current;
    setIsLoading(true);

    let activeQueue = queue;
    if (newQueue && Array.isArray(newQueue) && newQueue.length > 0) {
      setQueue(newQueue);
      activeQueue = newQueue;
      const idx = newQueue.findIndex(s => s.id === song.id);
      setQueueIndex(idx !== -1 ? idx : 0);
    } else if (queue.length === 0 || !queue.some(s => s.id === song.id)) {
      setQueue([song]);
      setQueueIndex(0);
      activeQueue = [song];
    } else {
      const idx = queue.findIndex(s => s.id === song.id);
      setQueueIndex(idx !== -1 ? idx : 0);
    }

    setCurrentSong(song);
    setCurrentTime(0);
    setDuration(song.duration || 0);

    try {
      if (audio.src !== song.audio_url) {
        audio.src = song.audio_url;
        audio.load();
      }
      await audio.play();
      setIsPlaying(true);

      // Record play on server
      songService.recordPlay(song.id).catch(() => {});
    } catch (err) {
      console.warn('Autoplay prevented or playback interrupted:', err.message);
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  };

  const playSongAtIndex = (index) => {
    if (index >= 0 && index < queue.length) {
      setQueueIndex(index);
      playSong(queue[index]);
    }
  };

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!currentSong) {
      if (queue.length > 0) {
        playSong(queue[0]);
      }
      return;
    }

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (err) {
        console.error('Play failed:', err);
      }
    }
  };

  const nextSong = () => {
    if (queue.length === 0) return;

    if (isShuffle) {
      const randomIdx = Math.floor(Math.random() * queue.length);
      playSongAtIndex(randomIdx);
      return;
    }

    if (queueIndex < queue.length - 1) {
      playSongAtIndex(queueIndex + 1);
    } else if (repeatMode === 'all') {
      playSongAtIndex(0);
    }
  };

  const prevSong = () => {
    if (queue.length === 0) return;
    const audio = audioRef.current;

    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      setCurrentTime(0);
      return;
    }

    if (queueIndex > 0) {
      playSongAtIndex(queueIndex - 1);
    } else {
      playSongAtIndex(queue.length - 1);
    }
  };

  const seek = (time) => {
    const audio = audioRef.current;
    if (audio && !isNaN(time)) {
      audio.currentTime = time;
      setCurrentTime(time);
    }
  };

  const changeVolume = (val) => {
    const clamped = Math.max(0, Math.min(1, val));
    setVolume(clamped);
    setIsMuted(clamped === 0);
    localStorage.setItem('mouna_volume', clamped.toString());
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      setIsMuted(false);
      audio.volume = volume > 0 ? volume : 0.8;
      if (volume === 0) setVolume(0.8);
    } else {
      setIsMuted(true);
      audio.volume = 0;
    }
  };

  const toggleShuffle = () => {
    setIsShuffle(prev => !prev);
  };

  const toggleRepeat = () => {
    setRepeatMode(prev => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  };

  const playQueue = (songsList, startIndex = 0) => {
    if (!songsList || songsList.length === 0) return;
    const targetIndex = Math.max(0, Math.min(startIndex, songsList.length - 1));
    setQueue(songsList);
    setQueueIndex(targetIndex);
    playSong(songsList[targetIndex], songsList);
  };

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        isPlaying,
        isLoading,
        currentTime,
        duration,
        volume,
        isMuted,
        isShuffle,
        repeatMode,
        queue,
        queueIndex,
        playSong,
        playQueue,
        togglePlay,
        nextSong,
        prevSong,
        seek,
        setVolume: changeVolume,
        toggleMute,
        toggleShuffle,
        toggleRepeat
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};
