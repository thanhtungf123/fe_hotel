// src/api/axiosInstance.js
import axios from 'axios';

const API_BASE = (import.meta.env.VITE_API_BASE || 'http://localhost:8080/api').replace(/\/$/, '');

const instance = axios.create({
  baseURL: API_BASE,
  headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
  withCredentials: false, // không dùng cookie
});

// Tự động gắn token
instance.interceptors.request.use((config) => {
  try {
    const auth = JSON.parse(localStorage.getItem('auth') || '{}');
    if (auth?.token) {
      config.headers['X-Auth-Token'] = auth.token;
      // Thêm Bearer để phòng trường hợp BE chỉ đọc Authorization
      config.headers['Authorization'] = `Bearer ${auth.token}`;
    }
  } catch {}
  return config;
});

export default instance;
