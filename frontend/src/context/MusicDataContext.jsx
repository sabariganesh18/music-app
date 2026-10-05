import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { likedService, playlistService } from '../services/api';
import { useAuth } from './AuthContext';

const MusicDataContext = createContext(null);

export const MusicDataProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  const [likedSongIds, setLikedSongIds] = useState(new Set());
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);
  const [selectedSongForModal, setSelectedSongForModal] = useState(null);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [playlistToEdit, setPlaylistToEdit] = useState(null);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Fetch liked IDs and playlists when authenticated
  const refreshData = useCallback(async () => {
    if (!isAuthenticated) {
      setLikedSongIds(new Set());
      setUserPlaylists([]);
      return;
    }

    try {
      const [likedRes, playlistsRes] = await Promise.all([
        likedService.getLikedSongIds().catch(() => ({ data: { likedSongIds: [] } })),
        playlistService.getUserPlaylists().catch(() => ({ data: { playlists: [] } }))
      ]);

      if (likedRes.data?.likedSongIds) {
        setLikedSongIds(new Set(likedRes.data.likedSongIds));
      }
      if (playlistsRes.data?.playlists) {
        setUserPlaylists(playlistsRes.data.playlists);
      }
    } catch (err) {
      console.error('Error refreshing music data:', err);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Toggle like/unlike
  const toggleLike = async (song) => {
    if (!isAuthenticated) {
      showToast('Please login to like songs');
      return false;
    }

    const songId = song.id || song;
    const isCurrentlyLiked = likedSongIds.has(songId);

    // Optimistic UI update
    setLikedSongIds(prev => {
      const next = new Set(prev);
      if (isCurrentlyLiked) {
        next.delete(songId);
      } else {
        next.add(songId);
      }
      return next;
    });

    try {
      if (isCurrentlyLiked) {
        await likedService.unlikeSong(songId);
        showToast('Removed from Liked Songs');
      } else {
        await likedService.likeSong(songId);
        showToast('Added to Liked Songs');
      }
      return true;
    } catch (err) {
      // Revert on failure
      setLikedSongIds(prev => {
        const next = new Set(prev);
        if (isCurrentlyLiked) {
          next.add(songId);
        } else {
          next.delete(songId);
        }
        return next;
      });
      showToast('Failed to update liked songs');
      return false;
    }
  };

  const isLiked = (songId) => {
    return likedSongIds.has(songId);
  };

  // Playlist actions
  const createPlaylist = async (title, description, cover_image) => {
    if (!isAuthenticated) {
      showToast('Please login to create playlists');
      return null;
    }

    try {
      const res = await playlistService.createPlaylist({ title, description, cover_image });
      if (res.data.success) {
        showToast(`Created playlist "${title}"`);
        refreshData();
        return res.data.playlist;
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create playlist');
      return null;
    }
  };

  const updatePlaylist = async (id, data) => {
    try {
      const res = await playlistService.updatePlaylist(id, data);
      if (res.data.success) {
        showToast('Playlist updated');
        refreshData();
        return true;
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update playlist');
      return false;
    }
  };

  const deletePlaylist = async (id) => {
    try {
      const res = await playlistService.deletePlaylist(id);
      if (res.data.success) {
        showToast('Playlist deleted');
        refreshData();
        return true;
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete playlist');
      return false;
    }
  };

  const addSongToPlaylist = async (playlistId, songId) => {
    try {
      const res = await playlistService.addSongToPlaylist(playlistId, songId);
      if (res.data.success) {
        showToast('Added to playlist');
        refreshData();
        return true;
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add song');
      return false;
    }
  };

  const removeSongFromPlaylist = async (playlistId, songId) => {
    try {
      const res = await playlistService.removeSongFromPlaylist(playlistId, songId);
      if (res.data.success) {
        showToast('Removed from playlist');
        refreshData();
        return true;
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to remove song');
      return false;
    }
  };

  const openAddToPlaylistModal = (song) => {
    if (!isAuthenticated) {
      showToast('Please login to manage playlists');
      return;
    }
    setSelectedSongForModal(song);
  };

  const closeAddToPlaylistModal = () => {
    setSelectedSongForModal(null);
  };

  const openCreatePlaylistModal = (playlistToEditData = null) => {
    if (!isAuthenticated) {
      showToast('Please login to create playlists');
      return;
    }
    setPlaylistToEdit(playlistToEditData);
    setIsPlaylistModalOpen(true);
  };

  const closeCreatePlaylistModal = () => {
    setPlaylistToEdit(null);
    setIsPlaylistModalOpen(false);
  };

  return (
    <MusicDataContext.Provider
      value={{
        likedSongIds,
        userPlaylists,
        isLiked,
        toggleLike,
        createPlaylist,
        updatePlaylist,
        deletePlaylist,
        addSongToPlaylist,
        removeSongFromPlaylist,
        refreshData,
        showToast,
        toastMessage,
        selectedSongForModal,
        openAddToPlaylistModal,
        closeAddToPlaylistModal,
        isPlaylistModalOpen,
        playlistToEdit,
        openCreatePlaylistModal,
        closeCreatePlaylistModal
      }}
    >
      {children}
    </MusicDataContext.Provider>
  );
};

export const useMusicData = () => {
  const context = useContext(MusicDataContext);
  if (!context) {
    throw new Error('useMusicData must be used within a MusicDataProvider');
  }
  return context;
};
