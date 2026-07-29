import axios from "axios";
import { normalizeApiError } from "@/lib/api-error";

/**
 * API client dùng cho signup, login, refresh và logout.
 * Các request này không gắn Bearer token và không tự kích hoạt refresh.
 */
const publicApiClient = axios.create({
  baseURL: "/api/proxy",
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Trả `response.data` và chuẩn hóa lỗi giống protected client.
 */
publicApiClient.interceptors.response.use(
  (response) => (response.status === 204 ? undefined : response.data),
  (error: unknown) => Promise.reject(normalizeApiError(error)),
);

export default publicApiClient;
