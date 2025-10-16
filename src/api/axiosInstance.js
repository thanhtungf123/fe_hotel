import axios from "axios";

const axiosInstance = axios.create({
  baseURL: (import.meta.env?.VITE_API_BASE || "http://localhost:8080/api").replace(/\/+$/, ""),
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// Gắn token từ localStorage (nếu có)
axiosInstance.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem("auth");
    if (raw) {
      const auth = JSON.parse(raw);
      if (auth?.token) {
        config.headers["X-Auth-Token"] = auth.token;
      }
    }
  } catch {
    // bỏ qua lỗi parse
  }
  return config;
});

// Chuẩn hoá lỗi (tuỳ chọn)
axiosInstance.interceptors.response.use(
  (res) => res,
  (err) => {
    // để nguyên cho caller xử lý message, nhưng đảm bảo có shape chuẩn
    if (!err.response) {
      err.response = { data: { message: "Không thể kết nối máy chủ." }, status: 0 };
    }
    return Promise.reject(err);
  }
);

export default axiosInstance;
