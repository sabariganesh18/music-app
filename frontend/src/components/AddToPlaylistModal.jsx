import React from 'react';
import { X, Plus, Music, Check, Disc } from 'lucide-react';
import { useMusicData } from '../context/MusicDataContext';

const AddToPlaylistModal = () => {
  const {
    selectedSongForModal,
    closeAddToPlaylistModal,
    userPlaylists,
    addSongToPlaylist,
    openCreatePlaylistModal
  } = useMusicData();

  if (!selectedSongForModal) return null;

  const handleSelectPlaylist = async (playlistId) => {
    await addSongToPlaylist(playlistId, selectedSongForModal.id);
    closeAddToPlaylistModal();
  };

  const handleCreateNew = () => {
    closeAddToPlaylistModal();
    openCreatePlaylistModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#282828] border border-[#3e3e3e] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#383838]">
          <div>
            <h2 className="text-base font-bold text-white">Add to Playlist</h2>
            <p className="text-xs text-[#a0a0a0] truncate max-w-[280px]">
              {selectedSongForModal.title} • {selectedSongForModal.artist_name}
            </p>
          </div>
          <button
            onClick={closeAddToPlaylistModal}
            className="text-[#b3b3b3] hover:text-white p-1 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Create New Playlist button */}
        <div className="p-3 border-b border-[#383838]">
          <button
            onClick={handleCreateNew}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#333333] hover:bg-[#3e3e3e] text-white font-medium text-sm transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-[#1db954] flex items-center justify-center text-black shadow">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">New Playlist</p>
              <p className="text-xs text-[#a0a0a0]">Create a new playlist with this song</p>
            </div>
          </button>
        </div>

        {/* List of user's playlists */}
        <div className="overflow-y-auto flex-1 p-3 space-y-1">
          <p className="text-xs font-semibold text-[#888888] px-2 py-1 uppercase tracking-wider">
            Your Playlists
          </p>

          {userPlaylists.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#888888]">
              No playlists found. Create one above!
            </div>
          ) : (
            userPlaylists.map((pl) => (
              <button
                key={pl.id}
                onClick={() => handleSelectPlaylist(pl.id)}
                className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-[#383838] transition-colors text-left group"
              >
                <img
                  src={pl.cover_image || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&auto=format&fit=crop&q=80'}
                  alt={pl.title}
                  className="w-10 h-10 rounded object-cover flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="font-medium text-sm text-white truncate group-hover:text-[#1db954]">
                    {pl.title}
                  </h4>
                  <p className="text-xs text-[#888888]">
                    {pl.total_tracks || 0} songs
                  </p>
                </div>
                <Plus className="w-4 h-4 text-[#888888] group-hover:text-white" />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AddToPlaylistModal;
