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
      await setTokenResponse(response.data);
      toast.success("Đăng nhập thành công!");
      router.push("/");
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
      await removeToken();
      await removeCachedProfile();
    },
    onSuccess: () => {
      queryClient.clear();
      toast.success("Đăng xuất thành công!");
      router.push("/signin");
    },
  });
}