import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Pause, Clock } from 'lucide-react';
import { songService } from '../services/api';
import { usePlayer } from '../context/PlayerContext';
import SongRow from '../components/SongRow';

const formatDuration = (songs) => {
  const totalSeconds = songs.reduce((acc, s) => acc + (s.duration || 0), 0);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins} min ${secs > 0 ? `${secs} sec` : ''}`;
};

const AlbumView = () => {
  const { id } = useParams();
  const { currentSong, isPlaying, playQueue, togglePlay } = usePlayer();

  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAlbum = async () => {
      setLoading(true);
      try {
        const res = await songService.getAlbumById(id);
        if (res.data.success) {
          setAlbum(res.data.album);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Album not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchAlbum();
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center text-white animate-pulse">Loading album...</div>;
  }

  if (error || !album) {
    return <div className="p-16 text-center text-white font-bold">{error || 'Album not found.'}</div>;
  }

  const songs = album.songs || [];
  const isAlbumPlaying = songs.length > 0 && songs.some(s => s.id === currentSong?.id) && isPlaying;

  const handlePlayAll = () => {
    if (songs.length === 0) return;
    if (isAlbumPlaying) {
      togglePlay();
    } else {
      playQueue(songs, 0);
    }
  };

  return (
    <div className="pb-24 max-w-7xl mx-auto">
      {/* Album Header */}
      <div className="bg-gradient-to-b from-[#404040] to-[#121212] p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-end gap-6 shadow-xl">
        <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-xl overflow-hidden bg-[#181818] shadow-2xl flex-shrink-0">
          <img
            src={album.cover_image}
            alt={album.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 min-w-0 text-center sm:text-left">
          <span className="text-xs font-bold uppercase tracking-wider text-white">
            Album
          </span>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white mt-1 mb-2 tracking-tight">
            {album.title}
          </h1>

          <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-[#b3b3b3] font-medium">
            <Link to={`/artist/${album.artist_id}`} className="text-white font-bold hover:underline">
              {album.artist_name}
            </Link>
            <span>•</span>
            <span>{album.release_year}</span>
            <span>•</span>
            <span>{songs.length} songs</span>
            {songs.length > 0 && (
              <>
                <span>•</span>
                <span>{formatDuration(songs)}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Play Controls */}
      <div className="px-6 sm:px-8 py-5">
        <button
          onClick={handlePlayAll}
          disabled={songs.length === 0}
          className="w-14 h-14 rounded-full bg-[#1db954] hover:bg-[#1ed760] text-black flex items-center justify-center shadow-2xl transition-all hover:scale-105 active:scale-95"
        >
          {isAlbumPlaying ? (
            <Pause className="w-6 h-6 fill-black text-black" />
          ) : (
            <Play className="w-6 h-6 fill-black text-black ml-1" />
          )}
        </button>
      </div>

      {/* Track List */}
      <div className="px-6 sm:px-8">
        <div className="grid grid-cols-12 px-4 py-2 text-xs font-semibold text-[#888888] uppercase tracking-wider border-b border-[#282828] mb-2">
          <span className="col-span-1">#</span>
          <span className="col-span-8">Title</span>
          <span className="col-span-3 text-right pr-6 flex items-center justify-end gap-1">
            <Clock className="w-3.5 h-3.5" />
          </span>
        </div>

        <div className="space-y-1">
          {songs.map((song, idx) => (
            <SongRow
              key={song.id}
              song={song}
              index={idx}
              showAlbum={false}
              playlist={songs}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AlbumView;
