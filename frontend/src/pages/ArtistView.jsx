import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Play, Pause, CheckCircle2, Disc } from 'lucide-react';
import { songService } from '../services/api';
import { usePlayer } from '../context/PlayerContext';
import SongRow from '../components/SongRow';
import AlbumCard from '../components/AlbumCard';

const ArtistView = () => {
  const { id } = useParams();
  const { currentSong, isPlaying, playQueue, togglePlay } = usePlayer();

  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchArtist = async () => {
      setLoading(true);
      try {
        const res = await songService.getArtistById(id);
        if (res.data.success) {
          setArtist(res.data.artist);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Artist not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchArtist();
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center text-white animate-pulse">Loading artist details...</div>;
  }

  if (error || !artist) {
    return <div className="p-16 text-center text-white font-bold">{error || 'Artist not found.'}</div>;
  }

  const songs = artist.songs || [];
  const albums = artist.albums || [];
  const isArtistPlaying = songs.length > 0 && songs.some(s => s.id === currentSong?.id) && isPlaying;

  const handlePlayAll = () => {
    if (songs.length === 0) return;
    if (isArtistPlaying) {
      togglePlay();
    } else {
      playQueue(songs, 0);
    }
  };

  return (
    <div className="pb-24 max-w-7xl mx-auto space-y-8">
      {/* Artist Hero Banner */}
      <div className="relative h-72 sm:h-80 rounded-2xl overflow-hidden shadow-2xl flex items-end p-6 sm:p-8 bg-[#242424]">
        <img
          src={artist.image_url}
          alt={artist.name}
          className="absolute inset-0 w-full h-full object-cover brightness-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-black/40 to-transparent" />

        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-white uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4 text-[#1db954] fill-[#1db954]" />
            <span>Verified Artist</span>
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight">
            {artist.name}
          </h1>
          <p className="text-xs sm:text-sm text-white/90">
            {artist.monthly_listeners ? Number(artist.monthly_listeners).toLocaleString() : '1,200,000'} monthly listeners
          </p>
        </div>
      </div>

      {/* Play Controls & Bio */}
      <div className="px-6 sm:px-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <button
          onClick={handlePlayAll}
          disabled={songs.length === 0}
          className="w-14 h-14 rounded-full bg-[#1db954] hover:bg-[#1ed760] text-black flex items-center justify-center shadow-2xl transition-all hover:scale-105 active:scale-95"
        >
          {isArtistPlaying ? (
            <Pause className="w-6 h-6 fill-black text-black" />
          ) : (
            <Play className="w-6 h-6 fill-black text-black ml-1" />
          )}
        </button>

        {artist.bio && (
          <p className="text-xs text-[#a0a0a0] max-w-xl line-clamp-3">
            {artist.bio}
          </p>
        )}
      </div>

      {/* Popular Tracks */}
      <div className="px-6 sm:px-8 space-y-4">
        <h2 className="text-xl font-bold text-white">Popular Tracks</h2>
        <div className="bg-[#181818]/60 rounded-xl p-2 divide-y divide-[#282828]">
          {songs.map((song, idx) => (
            <SongRow
              key={song.id}
              song={song}
              index={idx}
              playlist={songs}
            />
          ))}
        </div>
      </div>

      {/* Discography / Albums */}
      {albums.length > 0 && (
        <div className="px-6 sm:px-8 space-y-4">
          <h2 className="text-xl font-bold text-white">Discography</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {albums.map((album) => (
              <AlbumCard key={album.id} album={{ ...album, artist_name: artist.name }} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ArtistView;
