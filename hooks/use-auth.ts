import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/api-client";
import { ApiResponse } from "@/interfaces/response/api-response.interface";
import { TokenResponse } from "@/interfaces/response/token-response.interface";
import { LoginRequest } from "@/app/(auth)/signin/_interfaces";
import { CreateAccountRequest } from "@/app/(auth)/signup/_interfaces";

export function useLogin() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      return apiClient.post<LoginRequest, ApiResponse<TokenResponse>>(
        "/identity-service/api/v1/authentication/token",
        credentials,
      );
    },
    onSuccess: (response: ApiResponse<TokenResponse>) => {
      if (response.data.accessToken) {
        localStorage.setItem("uniwise_token", response.data.accessToken);
      }
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
      router.push("/login");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
