import axios, { AxiosRequestConfig } from "axios";
import {
  getToken,
  getTokenResponse,
  setTokenResponse,
  removeToken,
  isTokenExpired,
} from "@/stores/token-store";
import { TokenResponse } from "@/interfaces/response/token-response.interface";
import { ApiResponse } from "@/interfaces/response/api-response.interface";
import { clearAccessTokenCookie, syncAccessTokenCookie } from "./token";

// Routes không cần token — bỏ qua refresh interceptor
const AUTH_ROUTES = [
  "/identity-service/api/v1/authentication/token",
  "/identity-service/api/v1/authentication/refresh",
  // "/identity-service/api/v1/accounts",
];

function isAuthRoute(url: string = ""): boolean {
  return AUTH_ROUTES.some((route) => url.includes(route));
}

const apiClient = axios.create({
  baseURL: "/api/proxy",
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Refresh logic ────────────────────────────────────────────────────────────
let refreshPromise: Promise<TokenResponse | null> | null = null;

export async function refreshAccessToken(): Promise<TokenResponse | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const tokenResponse = await getTokenResponse();
      if (!tokenResponse?.refreshToken) {
        console.warn("[api-client] No refreshToken found");
        console.warn("[api-client] No refreshToken found, stack:", new Error().stack?.split('\n')[3]);
        return null;
      }

      // Dùng axios thuần để tránh vòng lặp interceptor
      // response.data      = ApiResponse<TokenResponse> { code, data, message }
      // response.data.data = TokenResponse
      const response = await axios.post<ApiResponse<TokenResponse>>(
        "/api/proxy/identity-service/api/v1/authentication/refresh",
        { refreshToken: tokenResponse.refreshToken },
        { headers: { "Content-Type": "application/json" } },
      );

      const newToken: TokenResponse = response.data.data;

      await setTokenResponse(newToken);
      await syncAccessTokenCookie(newToken);

      console.info("[api-client] Token refreshed successfully");
      return newToken;
    } catch (error) {
      console.error("[api-client] Refresh token failed:", error);
      await removeToken();
      await clearAccessTokenCookie();
      window.location.href = "/signin";
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// ─── Request interceptor ──────────────────────────────────────────────────────
apiClient.interceptors.request.use(async (config) => {
  if (isAuthRoute(config.url)) return config;

  // Chỉ refresh khi đang có session (có tokenResponse trong IndexedDB)
  // Không có token → request public hoặc sẽ bị 401, không cần refresh
  const tokenResponse = await getTokenResponse();
  if (tokenResponse && await isTokenExpired()) {
    await refreshAccessToken();
  }

  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ─── Response interceptor ─────────────────────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Bỏ qua auth routes — tránh refresh loop khi chính request refresh bị lỗi
    if (isAuthRoute(originalRequest.url)) {
      const data = error.response?.data;
      error.message = data?.detail || data?.message || "Đã có lỗi xảy ra";
      return Promise.reject(error);
    }

    // 401 và chưa retry → refresh rồi retry request gốc
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const newToken = await refreshAccessToken();

      if (newToken) {
        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${newToken.accessToken}`,
        };
        return apiClient(originalRequest);
      }
    }

    const data = error.response?.data;
    error.message = data?.detail || data?.message || "Đã có lỗi xảy ra";
    return Promise.reject(error);
  },
);

export default apiClient;