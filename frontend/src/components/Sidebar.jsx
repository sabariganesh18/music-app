import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Search, Library, PlusSquare, Heart, Music2, Disc } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMusicData } from '../context/MusicDataContext';

const Sidebar = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { userPlaylists, openCreatePlaylistModal } = useMusicData();

  const handleCreatePlaylistClick = () => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      openCreatePlaylistModal();
    }
  };

  const navItemClass = ({ isActive }) =>
    `flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
      isActive
        ? 'text-white bg-[#282828]'
        : 'text-[#b3b3b3] hover:text-white hover:bg-[#1a1a1a]'
    }`;

  return (
    <aside className="w-64 bg-[#000000] h-full flex flex-col p-3 select-none flex-shrink-0">
      {/* Brand & Logo */}
      <div 
        onClick={() => navigate('/')}
        className="flex items-center gap-3 px-3 py-4 cursor-pointer group"
      >
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#1db954] to-[#1ed760] flex items-center justify-center text-black shadow-lg shadow-green-500/20 group-hover:scale-105 transition-transform">
          <Music2 className="w-5 h-5 fill-black" />
        </div>
        <div>
          <h1 className="font-bold text-lg text-white tracking-tight leading-none group-hover:text-[#1db954] transition-colors">
            Mouna Ragam
          </h1>
          <span className="text-[11px] text-[#b3b3b3] font-medium tracking-wide">
            Melody & Music
          </span>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="bg-[#121212] rounded-xl p-2 mb-2 flex flex-col gap-1">
        <NavLink to="/" className={navItemClass} end>
          <Home className="w-5 h-5" />
          <span>Home</span>
        </NavLink>
        <NavLink to="/search" className={navItemClass}>
          <Search className="w-5 h-5" />
          <span>Search</span>
        </NavLink>
      </div>

      {/* Library & Playlists Section */}
      <div className="bg-[#121212] rounded-xl p-3 flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between px-2 py-2 mb-2">
          <NavLink
            to="/library"
            className="flex items-center gap-3 text-[#b3b3b3] hover:text-white font-semibold text-sm transition-colors"
          >
            <Library className="w-5 h-5" />
            <span>Your Library</span>
          </NavLink>

          <button
            onClick={handleCreatePlaylistClick}
            title="Create Playlist"
            className="text-[#b3b3b3] hover:text-white hover:bg-[#282828] p-1.5 rounded-full transition-all"
          >
            <PlusSquare className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Shortcuts */}
        <div className="space-y-1 mb-3">
          <NavLink
            to="/liked"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'text-white bg-[#282828]'
                  : 'text-[#b3b3b3] hover:text-white hover:bg-[#1a1a1a]'
              }`
            }
          >
            <div className="w-7 h-7 rounded bg-gradient-to-br from-[#450af5] to-[#8e8ee5] flex items-center justify-center text-white shadow">
              <Heart className="w-3.5 h-3.5 fill-white" />
            </div>
            <span>Liked Songs</span>
          </NavLink>
        </div>

        <div className="h-[1px] bg-[#282828] my-1 mx-2" />

        {/* User Playlists Scrollable List */}
        <div className="flex-1 overflow-y-auto space-y-0.5 pr-1 mt-2">
          {isAuthenticated ? (
            userPlaylists.length > 0 ? (
              userPlaylists.map((pl) => (
                <NavLink
                  key={pl.id}
                  to={`/playlist/${pl.id}`}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors truncate ${
                      isActive
                        ? 'text-[#1db954] font-medium bg-[#1e1e1e]'
                        : 'text-[#a7a7a7] hover:text-white hover:bg-[#181818]'
                    }`
                  }
                >
                  <Disc className="w-4 h-4 flex-shrink-0 opacity-70" />
                  <span className="truncate">{pl.title}</span>
                </NavLink>
              ))
            ) : (
              <div className="px-3 py-4 text-xs text-[#777777] text-center">
                No playlists yet. Create one!
              </div>
            )
          ) : (
            <div className="px-3 py-4 text-center">
              <p className="text-xs text-[#888888] mb-3">
                Log in to create and save your custom playlists.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="text-xs font-semibold bg-white text-black px-4 py-2 rounded-full hover:scale-105 transition-transform"
              >
                Log In
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
