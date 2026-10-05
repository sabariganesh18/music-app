import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Heart, Disc, Sparkles, Flame, Users, Radio } from 'lucide-react';
import { songService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { usePlayer } from '../context/PlayerContext';
import SongCard from '../components/SongCard';
import SongRow from '../components/SongRow';
import ArtistCard from '../components/ArtistCard';
import AlbumCard from '../components/AlbumCard';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const Home = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { playQueue } = usePlayer();

  const [songs, setSongs] = useState([]);
  const [artists, setArtists] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [recentSongs, setRecentSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [songsRes, artistsRes, albumsRes] = await Promise.all([
          songService.getSongs(),
          songService.getArtists(),
          songService.getAlbums()
        ]);

        if (songsRes.data.success) setSongs(songsRes.data.songs || []);
        if (artistsRes.data.success) setArtists(artistsRes.data.artists || []);
        if (albumsRes.data.success) setAlbums(albumsRes.data.albums || []);

        if (isAuthenticated) {
          try {
            const recentRes = await songService.getRecentlyPlayed();
            if (recentRes.data.success) {
              setRecentSongs(recentRes.data.recent || []);
            }
          } catch (e) {
            console.warn('Recently played fetch error:', e);
          }
        }
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div className="p-8 space-y-8 animate-pulse">
        <div className="h-10 w-64 bg-[#282828] rounded-lg" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-16 bg-[#282828] rounded-lg" />
          ))}
        </div>
        <div className="h-8 w-48 bg-[#282828] rounded-lg mt-8" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-60 bg-[#282828] rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const quickChips = [
    {
      title: 'Liked Songs',
      icon: <Heart className="w-5 h-5 fill-white text-white" />,
      gradient: 'from-[#450af5] to-[#8e8ee5]',
      action: () => navigate('/liked')
    },
    ...albums.slice(0, 5).map(alb => ({
      title: alb.title,
      image: alb.cover_image,
      action: () => navigate(`/album/${alb.id}`)
    }))
  ];

  return (
    <div className="pb-16 px-6 pt-4 max-w-7xl mx-auto space-y-10">
      {/* 1. Header Greeting & Quick Chips */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-5 tracking-tight">
          {getGreeting()}{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {quickChips.map((chip, idx) => (
            <div
              key={idx}
              onClick={chip.action}
              className="group flex items-center gap-4 bg-[#282828]/70 hover:bg-[#383838] transition-all rounded-lg overflow-hidden cursor-pointer pr-4 shadow-sm"
            >
              {chip.image ? (
                <img
                  src={chip.image}
                  alt={chip.title}
                  className="w-16 h-16 object-cover flex-shrink-0"
                />
              ) : (
                <div className={`w-16 h-16 flex items-center justify-center bg-gradient-to-br ${chip.gradient} flex-shrink-0`}>
                  {chip.icon}
                </div>
              )}
              <span className="font-bold text-sm text-white truncate flex-1">
                {chip.title}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  chip.action();
                }}
                className="w-10 h-10 rounded-full bg-[#1db954] text-black items-center justify-center opacity-0 group-hover:opacity-100 shadow-xl transition-all hidden sm:flex hover:scale-105"
              >
                <Play className="w-4 h-4 fill-black ml-0.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Recently Played Section (if user has any) */}
      {recentSongs.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Radio className="w-5 h-5 text-[#1db954]" />
              Recently Played
            </h2>
            <button
              onClick={() => navigate('/library')}
              className="text-xs font-bold text-[#b3b3b3] hover:text-white uppercase tracking-wider transition-colors"
            >
              Show all
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {recentSongs.slice(0, 5).map((song) => (
              <SongCard key={`recent-${song.id}`} song={song} playlist={recentSongs} />
            ))}
          </div>
        </section>
      )}

      {/* 3. Popular Songs / Trending Hits */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-[#1db954]" />
              Popular Songs
            </h2>
            <p className="text-xs text-[#a0a0a0]">Top tunes loved by listeners</p>
          </div>
          <button
            onClick={() => playQueue(songs, 0)}
            className="flex items-center gap-2 bg-[#282828] hover:bg-[#333333] text-white text-xs font-semibold px-4 py-2 rounded-full transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            Play All
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {songs.slice(0, 5).map((song) => (
            <SongCard key={song.id} song={song} playlist={songs} />
          ))}
        </div>
      </section>

      {/* 4. Popular Artists */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-[#1db954]" />
              Popular Artists
            </h2>
            <p className="text-xs text-[#a0a0a0]">Iconic composers and playback singers</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {artists.map((artist) => (
            <ArtistCard key={artist.id} artist={artist} />
          ))}
        </div>
      </section>

      {/* 5. Recommended Albums */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Disc className="w-5 h-5 text-[#1db954]" />
              Recommended Albums
            </h2>
            <p className="text-xs text-[#a0a0a0]">Timeless soundtracks & melody collections</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {albums.map((album) => (
            <AlbumCard key={album.id} album={album} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
