import React, { useState, useEffect, useMemo } from 'react';
import { Search as SearchIcon, X, Music, AlertCircle } from 'lucide-react';
import { songService } from '../services/api';
import SongRow from '../components/SongRow';
import SongCard from '../components/SongCard';
import ArtistCard from '../components/ArtistCard';
import AlbumCard from '../components/AlbumCard';

const GENRE_CATEGORIES = [
  { name: 'Romantic Melodies', color: 'from-pink-600 to-rose-900', img: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&auto=format&fit=crop&q=80' },
  { name: 'Classical Harmonies', color: 'from-amber-600 to-amber-900', img: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80' },
  { name: 'Electro Pop', color: 'from-purple-600 to-indigo-900', img: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&auto=format&fit=crop&q=80' },
  { name: 'Acoustic Soul', color: 'from-emerald-600 to-teal-900', img: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&auto=format&fit=crop&q=80' },
  { name: 'World Fusion', color: 'from-blue-600 to-cyan-900', img: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&auto=format&fit=crop&q=80' },
  { name: 'Late Night Chill', color: 'from-indigo-600 to-violet-900', img: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=400&auto=format&fit=crop&q=80' }
];

const Search = ({ searchQuery, setSearchQuery }) => {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'songs' | 'artists' | 'albums'
  const [allSongs, setAllSongs] = useState([]);
  const [allArtists, setAllArtists] = useState([]);
  const [allAlbums, setAllAlbums] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [songsRes, artistsRes, albumsRes] = await Promise.all([
          songService.getSongs(),
          songService.getArtists(),
          songService.getAlbums()
        ]);
        if (songsRes.data.success) setAllSongs(songsRes.data.songs || []);
        if (artistsRes.data.success) setAllArtists(artistsRes.data.artists || []);
        if (albumsRes.data.success) setAllAlbums(albumsRes.data.albums || []);
      } catch (err) {
        console.error('Error fetching search data:', err);
      }
    };
    fetchInitialData();
  }, []);

  const query = (searchQuery || '').trim().toLowerCase();

  // Filtered results
  const filteredSongs = useMemo(() => {
    if (!query) return [];
    return allSongs.filter(s => 
      s.title.toLowerCase().includes(query) ||
      (s.artist_name && s.artist_name.toLowerCase().includes(query)) ||
      (s.album_title && s.album_title.toLowerCase().includes(query)) ||
      (s.genre && s.genre.toLowerCase().includes(query))
    );
  }, [allSongs, query]);

  const filteredArtists = useMemo(() => {
    if (!query) return [];
    return allArtists.filter(a => a.name.toLowerCase().includes(query));
  }, [allArtists, query]);

  const filteredAlbums = useMemo(() => {
    if (!query) return [];
    return allAlbums.filter(al => 
      al.title.toLowerCase().includes(query) ||
      (al.artist_name && al.artist_name.toLowerCase().includes(query))
    );
  }, [allAlbums, query]);

  const hasResults = filteredSongs.length > 0 || filteredArtists.length > 0 || filteredAlbums.length > 0;

  return (
    <div className="pb-16 px-6 pt-4 max-w-7xl mx-auto space-y-6">
      {/* Large Search Bar */}
      <div className="relative max-w-2xl">
        <SearchIcon className="w-5 h-5 text-[#888888] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery || ''}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search songs, artists, albums, or genres..."
          className="w-full bg-[#242424] text-white text-base pl-12 pr-10 py-3.5 rounded-full border border-transparent focus:border-white/30 focus:outline-none focus:bg-[#2a2a2a] transition-all placeholder-[#777777] shadow-lg"
          autoFocus
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#888888] hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter Tabs when query is typed */}
      {query && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {['all', 'songs', 'artists', 'albums'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all capitalize ${
                activeTab === tab
                  ? 'bg-white text-black'
                  : 'bg-[#242424] text-white hover:bg-[#303030]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      )}

      {/* Search Results / Empty Browse State */}
      {!query ? (
        <div className="space-y-6 pt-2">
          <h2 className="text-xl font-bold text-white tracking-tight">
            Browse All Genres & Moods
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {GENRE_CATEGORIES.map((cat, idx) => (
              <div
                key={idx}
                onClick={() => setSearchQuery(cat.name.split(' ')[0])}
                className={`relative h-44 rounded-xl p-4 overflow-hidden bg-gradient-to-br ${cat.color} cursor-pointer hover:scale-[1.02] transition-transform shadow-lg group`}
              >
                <h3 className="font-bold text-base text-white break-words relative z-10">
                  {cat.name}
                </h3>
                <img
                  src={cat.img}
                  alt={cat.name}
                  className="w-20 h-20 absolute -right-2 -bottom-2 rounded-lg object-cover rotate-[25deg] shadow-2xl transition-transform group-hover:rotate-[15deg] group-hover:scale-110"
                />
              </div>
            ))}
          </div>

          <div className="pt-6">
            <h3 className="text-lg font-bold text-white mb-4">Trending Songs</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {allSongs.slice(0, 5).map((song) => (
                <SongCard key={song.id} song={song} playlist={allSongs} />
              ))}
            </div>
          </div>
        </div>
      ) : hasResults ? (
        <div className="space-y-8">
          {/* Top Result + Songs (if 'all' or 'songs') */}
          {(activeTab === 'all' || activeTab === 'songs') && filteredSongs.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white">Songs</h2>
              <div className="bg-[#181818]/60 rounded-xl p-2 divide-y divide-[#282828]">
                {filteredSongs.slice(0, activeTab === 'songs' ? 20 : 5).map((song, idx) => (
                  <SongRow
                    key={song.id}
                    song={song}
                    index={idx}
                    playlist={filteredSongs}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Artists (if 'all' or 'artists') */}
          {(activeTab === 'all' || activeTab === 'artists') && filteredArtists.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white">Artists</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredArtists.map((artist) => (
                  <ArtistCard key={artist.id} artist={artist} />
                ))}
              </div>
            </div>
          )}

          {/* Albums (if 'all' or 'albums') */}
          {(activeTab === 'all' || activeTab === 'albums') && filteredAlbums.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white">Albums</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredAlbums.map((album) => (
                  <AlbumCard key={album.id} album={album} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* No Results Found State */
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#242424] flex items-center justify-center text-[#888888]">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              No results found for "{searchQuery}"
            </h3>
            <p className="text-xs text-[#a0a0a0] mt-1 max-w-sm">
              Please make sure your words are spelled correctly, or try searching for another artist, song, or genre.
            </p>
          </div>
          <button
            onClick={() => setSearchQuery('')}
            className="bg-white text-black font-semibold text-xs px-5 py-2 rounded-full hover:scale-105 transition-transform"
          >
            Clear Search
          </button>
        </div>
      )}
    </div>
  );
};

export default Search;
