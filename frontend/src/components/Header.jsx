import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, User, LogOut, Heart, PlusCircle, Search as SearchIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMusicData } from '../context/MusicDataContext';

const Header = ({ searchQuery, setSearchQuery }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { openCreatePlaylistModal } = useMusicData();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isSearchPage = location.pathname === '/search';

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  return (
    <header className="h-16 px-6 bg-[#121212]/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between border-b border-[#242424]/40">
      {/* Navigation arrows & optional search */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            aria-label="Go Back"
            className="w-8 h-8 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition-colors disabled:opacity-40"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigate(1)}
            aria-label="Go Forward"
            className="w-8 h-8 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition-colors disabled:opacity-40"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar on Search Page */}
        {isSearchPage && (
          <div className="relative flex-1 max-w-md">
            <SearchIcon className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery || ''}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="What do you want to play?"
              className="w-full bg-[#242424] text-white text-sm pl-10 pr-4 py-2.5 rounded-full border border-transparent focus:border-white/30 focus:outline-none focus:bg-[#2a2a2a] transition-all placeholder-[#777777]"
              autoFocus
            />
          </div>
        )}
      </div>

      {/* Auth & User Menu */}
      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 bg-black/60 hover:bg-[#282828] p-1.5 pr-3 rounded-full transition-all border border-[#333333]"
            >
              <img
                src={user?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'User')}`}
                alt={user?.name}
                className="w-7 h-7 rounded-full object-cover"
              />
              <span className="text-sm font-semibold text-white max-w-[120px] truncate">
                {user?.name}
              </span>
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-[#282828] border border-[#3e3e3e] rounded-lg shadow-2xl py-1.5 z-50 text-sm">
                <Link
                  to="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-white hover:bg-[#383838] transition-colors"
                >
                  <User className="w-4 h-4 text-[#b3b3b3]" />
                  <span>Profile</span>
                </Link>

                <Link
                  to="/liked"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-white hover:bg-[#383838] transition-colors"
                >
                  <Heart className="w-4 h-4 text-[#b3b3b3]" />
                  <span>Liked Songs</span>
                </Link>

                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    openCreatePlaylistModal();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-white hover:bg-[#383838] transition-colors text-left"
                >
                  <PlusCircle className="w-4 h-4 text-[#b3b3b3]" />
                  <span>Create Playlist</span>
                </button>

                <div className="h-[1px] bg-[#3e3e3e] my-1" />

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-[#ff5c5c] hover:bg-[#383838] transition-colors text-left font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link
              to="/register"
              className="text-[#b3b3b3] hover:text-white font-semibold text-sm transition-colors"
            >
              Sign up
            </Link>
            <Link
              to="/login"
              className="bg-white text-black font-bold text-sm px-6 py-2.5 rounded-full hover:scale-105 active:scale-95 transition-all shadow-md"
            >
              Log in
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
