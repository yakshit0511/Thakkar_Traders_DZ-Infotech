import axios from 'axios';

const FALLBACK_API_URL = 'https://thakkar-traders-dz-infotech.onrender.com/api';
const configuredApiUrl = import.meta.env.VITE_API_URL;
const baseURL =
  configuredApiUrl && !configuredApiUrl.includes('vercel.app')
    ? configuredApiUrl
    : FALLBACK_API_URL;

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});


api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
