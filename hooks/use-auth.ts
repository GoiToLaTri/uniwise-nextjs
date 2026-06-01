import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/api-client";
import { ApiResponse } from "@/interfaces/response/api-response.interface";
import { TokenResponse } from "@/interfaces/response/token-response.interface";
import { LoginRequest } from "@/app/(auth)/signin/_interfaces";
import { CreateAccountRequest } from "@/app/(auth)/signup/_interfaces";
import { setTokenResponse, removeToken, getTokenResponse } from "@/stores/token-store";
import { removeCachedProfile } from "@/stores/profile-store";
import { clearAccessTokenCookie, syncAccessTokenCookie } from "@/lib/token";
import { startTransition } from "react";
import { ACCOUNT_DETAIL_QUERY_KEY } from "./use-account";
import { PROFILE_QUERY_KEY } from "./use-profile";

export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      return apiClient.post<LoginRequest, ApiResponse<TokenResponse>>(
        "/identity-service/api/v1/authentication/token",
        credentials,
      );
    },
    onSuccess: async (response: ApiResponse<TokenResponse>) => {
      await Promise.all([
        setTokenResponse(response.data),        // Toàn bộ token vào IndexedDB
        syncAccessTokenCookie(response.data),   // Chỉ accessToken vào cookie cho proxy.ts
      ]);
 
      toast.success("Đăng nhập thành công!");
      
      await queryClient.invalidateQueries({queryKey: PROFILE_QUERY_KEY})

      // Force refetch ngay
      await queryClient.refetchQueries({ queryKey: PROFILE_QUERY_KEY });

      const params = new URLSearchParams(window.location.search);
      startTransition(() => {
        console.log("[use-auth] :::: params", params.get("redirect"))
        // router.replace(params.get("redirect") ?? "/");
        /**
         * window.location.assign chỉ dùng đúng 1 lần — tại thời điểm sau login. Đây là hard navigation có chủ đích vì:
         * Cần invalidate toàn bộ router cache (session mới)
         * Cần middleware đọc cookie mới
         * Cần server component re-render với auth context mới
         */
        window.location.replace(params.get("redirect") ?? "/");
        // window.location.assign(params.get("redirect") ?? "/");
        // router.refresh()
        // router.replace("/partners");

      console.log("[use-auth] :::: path: ", window.location.pathname);
      });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useSignup() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (values: CreateAccountRequest) => {
      return apiClient.post("/identity-service/api/v1/accounts", values);
    },
    onSuccess: () => {
      toast.success("Đăng ký thành công! Hãy đăng nhập.");
      router.push("/signin");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
 
  return useMutation({
    mutationFn: async () => {
      const tokenResponse = await getTokenResponse();
 
      // Gọi backend logout — gửi kèm sessionId để server revoke session
      // Dùng try/catch riêng để dù backend lỗi vẫn xóa local data
      try {
        await apiClient.post("/identity-service/api/v1/authentication/logout", {refreshToken: tokenResponse?.refreshToken});
      } catch (error) {
        // Backend lỗi không chặn logout ở client
        console.error("[useLogout] Backend logout failed:", error);
      }
 
      // Xóa local data sau khi gọi backend xong
      await Promise.all([
        removeToken(),
        removeCachedProfile(),
        clearAccessTokenCookie(),
      ]);
    },
    onSuccess: () => {
      queryClient.clear();
      toast.success("Đăng xuất thành công!");
      router.refresh();
      // router.push("/signin");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}