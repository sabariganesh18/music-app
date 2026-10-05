import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Heart, Disc, Radio, LogOut, Edit3, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';

const Profile = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, updateProfile } = useAuth();

  const [profileData, setProfileData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await authService.getProfile();
        if (res.data.success) {
          setProfileData(res.data.user);
          setName(res.data.user.name);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated, navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const res = await updateProfile({ name: name.trim() });
    if (res.success) {
      setMessage('Profile name updated!');
      setIsEditing(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return <div className="p-12 text-center text-white animate-pulse">Loading profile...</div>;
  }

  const stats = profileData?.stats || { likedSongs: 0, playlists: 0, recentlyPlayed: 0 };

  return (
    <div className="pb-24 max-w-4xl mx-auto px-6 pt-6 space-y-8">
      {/* Profile Header Hero */}
      <div className="bg-gradient-to-b from-[#2a2a2a] to-[#181818] border border-[#2e2e2e] p-8 rounded-2xl flex flex-col sm:flex-row items-center sm:items-start gap-6 shadow-xl">
        <div className="w-32 h-32 rounded-full overflow-hidden bg-[#1db954]/20 border-4 border-[#1db954] shadow-2xl flex-shrink-0">
          <img
            src={user?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'User')}`}
            alt={user?.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 min-w-0 text-center sm:text-left space-y-2">
          <span className="text-xs font-bold text-[#1db954] uppercase tracking-wider">
            Profile
          </span>

          {isEditing ? (
            <form onSubmit={handleUpdate} className="flex items-center gap-2 mt-1">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-[#2a2a2a] text-white text-xl font-bold px-3 py-1.5 rounded-lg border border-[#1db954] focus:outline-none"
                autoFocus
              />
              <button
                type="submit"
                className="bg-[#1db954] text-black p-2 rounded-lg font-bold hover:scale-105"
              >
                <Check className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <div className="flex items-center justify-center sm:justify-start gap-3">
              <h1 className="text-3xl font-black text-white tracking-tight">
                {user?.name}
              </h1>
              <button
                onClick={() => setIsEditing(true)}
                className="text-[#888888] hover:text-white p-1 rounded-full"
                title="Edit name"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
          )}

          <p className="text-sm text-[#a0a0a0] flex items-center justify-center sm:justify-start gap-2">
            <Mail className="w-4 h-4 text-[#777777]" />
            {user?.email}
          </p>

          {message && (
            <p className="text-xs text-[#1db954] font-medium pt-1">{message}</p>
          )}
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-[#ff5c5c]/10 hover:bg-[#ff5c5c]/20 text-[#ff5c5c] font-bold text-xs px-5 py-2.5 rounded-full transition-colors border border-[#ff5c5c]/30 self-center sm:self-start"
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </button>
      </div>

      {/* Stats Cards */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-white uppercase tracking-wider text-xs">
          Your Activity Summary
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div 
            onClick={() => navigate('/liked')}
            className="bg-[#181818] hover:bg-[#222222] border border-[#282828] p-5 rounded-xl transition-colors cursor-pointer flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#450af5] to-[#8e8ee5] flex items-center justify-center text-white shadow">
              <Heart className="w-6 h-6 fill-white" />
            </div>
            <div>
              <p className="text-2xl font-black text-white">{stats.likedSongs}</p>
              <p className="text-xs text-[#a0a0a0]">Liked Songs</p>
            </div>
          </div>

          <div 
            onClick={() => navigate('/library')}
            className="bg-[#181818] hover:bg-[#222222] border border-[#282828] p-5 rounded-xl transition-colors cursor-pointer flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-lg bg-[#1db954] flex items-center justify-center text-black shadow">
              <Disc className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-white">{stats.playlists}</p>
              <p className="text-xs text-[#a0a0a0]">Playlists Created</p>
            </div>
          </div>

          <div 
            onClick={() => navigate('/library')}
            className="bg-[#181818] hover:bg-[#222222] border border-[#282828] p-5 rounded-xl transition-colors cursor-pointer flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-lg bg-[#333333] flex items-center justify-center text-[#1db954] shadow">
              <Radio className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-white">{stats.recentlyPlayed}</p>
              <p className="text-xs text-[#a0a0a0]">Recently Played Tracks</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
