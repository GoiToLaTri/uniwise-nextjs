import axios from "axios";

const apiClient = axios.create({
  baseURL: "/api/proxy", // Sử dụng đường dẫn proxy đã cấu hình
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor xử lý Request (Ví dụ: Chèn Token)
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("uniwise_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor xử lý Response (Ví dụ: Bắt lỗi tập trung)
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.log(":::: error", error.response?.data);

    const data = error.response?.data;

    error.message = data?.detail || data?.message || "Đã có lỗi xảy ra";

    return Promise.reject(error);
  },
);

export default apiClient;
