import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? window.location.origin : 'http://127.0.0.1:8000');

export const apiClient = axios.create({
  baseURL: API_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
