import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/api-client";
import { ApiResponse } from "@/interfaces/response/api-response.interface";
import { TokenResponse } from "@/interfaces/response/token-response.interface";
import { LoginRequest } from "@/app/(auth)/signin/_interfaces";
import { CreateAccountRequest } from "@/app/(auth)/signup/_interfaces";
import { setTokenResponse, removeToken } from "@/stores/token-store";
import { removeCachedProfile } from "@/stores/profile-store";
import { clearAccessTokenCookie, syncAccessTokenCookie } from "@/lib/token";

export function useLogin() {
  const router = useRouter();
 
  return useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      return apiClient.post<LoginRequest, ApiResponse<TokenResponse>>(
        "/identity-service/api/v1/authentication/token",
        credentials,
      );
    },
    onSuccess: async (response: ApiResponse<TokenResponse>) => {
      console.log(":::: response", response)
      await Promise.all([
        setTokenResponse(response.data),        // Toàn bộ token vào IndexedDB
        syncAccessTokenCookie(response.data),   // Chỉ accessToken vào cookie cho proxy.ts
      ]);
 
      toast.success("Đăng nhập thành công!");
 
      const params = new URLSearchParams(window.location.search);
      router.refresh();
      router.push(params.get("redirect") ?? "/dashboard");
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
      await Promise.all([
        removeToken(),
        removeCachedProfile(),
        clearAccessTokenCookie(),
      ]);
    },
    onSuccess: () => {
      queryClient.clear();
      toast.success("Đăng xuất thành công!");
      router.push("/signin");
    },
  });
}