import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to automatically attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mouna_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor to handle auth expiration
api.interceptors.response.use((response) => {
  return response;
}, (error) => {
  if (error.response && error.response.status === 401) {
    // If token invalid, clear local auth
    const token = localStorage.getItem('mouna_token');
    if (token) {
      localStorage.removeItem('mouna_token');
      localStorage.removeItem('mouna_user');
      window.dispatchEvent(new Event('auth-logout'));
    }
  }
  return Promise.reject(error);
});

export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data)
};

export const songService = {
  getSongs: (params) => api.get('/songs', { params }),
  getSongById: (id) => api.get(`/songs/${id}`),
  getArtists: () => api.get('/artists'),
  getArtistById: (id) => api.get(`/artists/${id}`),
  getAlbums: () => api.get('/albums'),
  getAlbumById: (id) => api.get(`/albums/${id}`),
  getRecentlyPlayed: () => api.get('/recently-played'),
  recordPlay: (songId) => api.post('/songs/play', { songId })
};

export const playlistService = {
  getPlaylists: () => api.get('/playlists'),
  getUserPlaylists: () => api.get('/user/playlists'),
  getPlaylistById: (id) => api.get(`/playlists/${id}`),
  createPlaylist: (data) => api.post('/playlists', data),
  updatePlaylist: (id, data) => api.put(`/playlists/${id}`, data),
  deletePlaylist: (id) => api.delete(`/playlists/${id}`),
  addSongToPlaylist: (id, songId) => api.post(`/playlists/${id}/songs`, { songId }),
  removeSongFromPlaylist: (id, songId) => api.delete(`/playlists/${id}/songs/${songId}`)
};

export const likedService = {
  getLikedSongs: () => api.get('/liked'),
  getLikedSongIds: () => api.get('/liked/ids'),
  likeSong: (songId) => api.post(`/liked/${songId}`),
  unlikeSong: (songId) => api.delete(`/liked/${songId}`)
};

export default api;
