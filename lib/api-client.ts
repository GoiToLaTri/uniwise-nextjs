import axios, { AxiosRequestConfig } from "axios";
import { isTokenResponseExpired } from "@/stores/token-store";
import { normalizeApiError } from "./api-error";
import { readSessionSnapshot } from "./session-repository";
import { refreshSession } from "./token-refresh-coordinator";

const apiClient = axios.create({
  baseURL: "/api/proxy",
  headers: {
    "Content-Type": "application/json",
  },
});

// Trước mỗi request bảo vệ: refresh nếu cần rồi gắn access token.
apiClient.interceptors.request.use(async (config) => {
  // Không có session thì không refresh và cũng không gắn Authorization.
  let snapshot = await readSessionSnapshot();
  if (snapshot && isTokenResponseExpired(snapshot.tokenResponse)) {
    await refreshSession();
    snapshot = await readSessionSnapshot();
  }

  const token = snapshot?.tokenResponse.accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Chuẩn hóa response và xử lý trường hợp access token bị backend từ chối.
apiClient.interceptors.response.use(
  (response) => (response.status === 204 ? undefined : response.data),
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(normalizeApiError(error));
    }

    const originalRequest = error.config as
      | (AxiosRequestConfig & { _retry?: boolean })
      | undefined;

    // Khi gặp 401, refresh và gửi lại request cũ đúng một lần.
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      await refreshSession();
      const snapshot = await readSessionSnapshot();
      const accessToken = snapshot?.tokenResponse.accessToken;

      if (accessToken) {
        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${accessToken}`,
        };
        return apiClient(originalRequest);
      }
    }

    return Promise.reject(normalizeApiError(error));
  },
);

export default apiClient;
