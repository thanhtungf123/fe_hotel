import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "http://localhost:8080/api",
  headers: { "Content-Type": "application/json" },
});

// Gắn token từ localStorage (nếu có)
axiosInstance.interceptors.request.use((config) => {
  const raw = localStorage.getItem("auth");
  if (raw) {
    const auth = JSON.parse(raw);
    if (auth?.token) {
      config.headers["X-Auth-Token"] = auth.token;
    }
  }
  return config;
});

export default axiosInstance;
