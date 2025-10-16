import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "http://localhost:8080/api",
  headers: { "Content-Type": "application/json" },
});

axiosInstance.interceptors.request.use((config) => {
  try {
    const raw = sessionStorage.getItem("auth") || localStorage.getItem("auth");
    if (raw) {
      const auth = JSON.parse(raw);
      if (auth?.token) {
        config.headers["X-Auth-Token"] = auth.token;
      }
    }
  } catch (e) {
    console.warn("Auth parse error", e);
  }
  return config;
});

export default axiosInstance;