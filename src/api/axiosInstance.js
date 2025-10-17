import axios from "axios";

const axiosInstance = axios.create({
  baseURL: (import.meta.env?.VITE_API_BASE || "http://localhost:8080/api").replace(/\/+$/, ""),
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// === Interceptor: Request ===
axiosInstance.interceptors.request.use((config) => {
  try {
    // Ưu tiên sessionStorage, fallback sang localStorage
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

// === Interceptor: Response ===
axiosInstance.interceptors.response.use(
  (res) => res,
  (err) => {
    // Chuẩn hoá lỗi khi mất kết nối hoặc lỗi mạng
    if (!err.response) {
      err.response = { data: { message: "Không thể kết nối máy chủ." }, status: 0 };
    }
    return Promise.reject(err);
  }
);

export default axiosInstance;
