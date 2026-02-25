import axios from 'axios';

const rawBaseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const baseURL = rawBaseURL.endsWith('/') ? rawBaseURL.slice(0, -1) : rawBaseURL;

const api = axios.create({
  baseURL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
