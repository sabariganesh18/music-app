import React, { useState, useEffect } from 'react';
import { X, Music, Image as ImageIcon } from 'lucide-react';
import { useMusicData } from '../context/MusicDataContext';

const PRESET_COVERS = [
  'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80'
];

const PlaylistModal = () => {
  const {
    isPlaylistModalOpen,
    playlistToEdit,
    closeCreatePlaylistModal,
    createPlaylist,
    updatePlaylist
  } = useMusicData();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState(PRESET_COVERS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (playlistToEdit) {
      setTitle(playlistToEdit.title || '');
      setDescription(playlistToEdit.description || '');
      setCoverImage(playlistToEdit.cover_image || PRESET_COVERS[0]);
    } else {
      setTitle('');
      setDescription('');
      setCoverImage(PRESET_COVERS[Math.floor(Math.random() * PRESET_COVERS.length)]);
    }
    setError('');
  }, [playlistToEdit, isPlaylistModalOpen]);

  if (!isPlaylistModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please give your playlist a title.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      if (playlistToEdit) {
        await updatePlaylist(playlistToEdit.id, {
          title: title.trim(),
          description: description.trim(),
          cover_image: coverImage
        });
      } else {
        await createPlaylist(title.trim(), description.trim(), coverImage);
      }
      closeCreatePlaylistModal();
    } catch (err) {
      setError(err.message || 'Operation failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#282828] border border-[#3e3e3e] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#383838]">
          <h2 className="text-lg font-bold text-white">
            {playlistToEdit ? 'Edit Playlist Details' : 'Create New Playlist'}
          </h2>
          <button
            onClick={closeCreatePlaylistModal}
            className="text-[#b3b3b3] hover:text-white p-1 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-xs text-red-300">
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-5">
            {/* Cover Selector */}
            <div className="flex flex-col items-center gap-2 flex-shrink-0">
              <div className="w-36 h-36 rounded-xl overflow-hidden bg-[#181818] relative group border border-[#444444]">
                <img
                  src={coverImage}
                  alt="Playlist Cover"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-[11px] text-[#888888]">Select Artwork Style:</p>
              <div className="flex gap-1.5 overflow-x-auto max-w-[150px] pb-1">
                {PRESET_COVERS.map((cov, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => setCoverImage(cov)}
                    className={`w-6 h-6 rounded flex-shrink-0 overflow-hidden border ${
                      coverImage === cov ? 'border-[#1db954] scale-110' : 'border-transparent opacity-70'
                    }`}
                  >
                    <img src={cov} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Inputs */}
            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#b3b3b3] mb-1.5">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="My Awesome Playlist"
                  className="w-full bg-[#3e3e3e] text-white px-3.5 py-2.5 rounded-lg text-sm border border-transparent focus:border-[#1db954] focus:outline-none focus:bg-[#484848] transition-all"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#b3b3b3] mb-1.5">
                  Description (Optional)
                </label>
                <textarea
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Give your playlist a lovely description"
                  className="w-full bg-[#3e3e3e] text-white px-3.5 py-2.5 rounded-lg text-sm border border-transparent focus:border-[#1db954] focus:outline-none focus:bg-[#484848] transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#383838]">
            <button
              type="button"
              onClick={closeCreatePlaylistModal}
              className="px-5 py-2 rounded-full text-sm font-semibold text-white hover:text-white/80 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#1db954] hover:bg-[#1ed760] text-black font-bold px-6 py-2 rounded-full text-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : playlistToEdit ? 'Save Changes' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlaylistModal;
