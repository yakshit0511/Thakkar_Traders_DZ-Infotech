import axios from 'axios';

const FALLBACK_API_URL = 'https://thakkar-traders-dz-infotech.onrender.com/api';
const configuredApiUrl = import.meta.env.VITE_API_URL;
const baseURL =
  configuredApiUrl && !configuredApiUrl.includes('vercel.app')
    ? configuredApiUrl
    : FALLBACK_API_URL;

const adminAxios = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

adminAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('thakkar_admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

adminAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Clear token and reload or redirect to login
      localStorage.removeItem('thakkar_admin_token');
      // Only redirect if not already on the login page to prevent infinite loop
      if (!window.location.pathname.includes('/admin/login')) {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

export default adminAxios;
