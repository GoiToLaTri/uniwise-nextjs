import { refreshAccessToken } from "@/lib/api-client";
import { removeCachedProfile } from "@/stores/profile-store";
import { getTokenResponse, isTokenExpired, removeToken } from "@/stores/token-store";
import { useEffect, useRef } from "react";

const CHECK_INTERVAL_MS = 60 * 1000; // Kiểm tra mỗi 1 phút
const REFRESH_THRESHOLD_MS = 3 * 60 * 1000; // Refresh khi còn 3 phút

/**
 * Hook tự động refresh token ngầm trước khi hết hạn.
 * Đặt ở layout bọc các protected routes.
 */
export function useTokenRefresh() {
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
   
    useEffect(() => {
      async function checkAndRefresh() {
        const tokenResponse = await getTokenResponse();
        if (!tokenResponse) return;
   
        const expiresAt = new Date(tokenResponse.expiresAt).getTime();
        const timeLeft = expiresAt - Date.now();
   
        if (timeLeft > REFRESH_THRESHOLD_MS) return;
   
        if (await isTokenExpired()) {
          await Promise.all([removeToken(), removeCachedProfile()]);
          await fetch("/api/auth/token", { method: "DELETE" });
          return;
        }
   
        // Dùng refreshAccessToken từ api-client — singleton refreshPromise
        // đảm bảo dù interceptor cũng đang refresh thì chỉ có 1 request duy nhất
        // console.info("[useTokenRefresh] Token sắp hết hạn, đang refresh ngầm...");
        await refreshAccessToken();
      }
   
      checkAndRefresh();
      timerRef.current = setInterval(checkAndRefresh, CHECK_INTERVAL_MS);
   
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }, []);
  }