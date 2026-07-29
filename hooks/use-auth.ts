import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import publicApiClient from "@/lib/public-api-client";
import { ApiResponse } from "@/interfaces/response/api-response.interface";
import { TokenResponse } from "@/interfaces/response/token-response.interface";
import { LoginRequest } from "@/app/(auth)/signin/_interfaces";
import { CreateAccountRequest } from "@/app/(auth)/signup/_interfaces";
import { startTransition } from "react";
import { PROFILE_QUERY_KEY } from "./use-profile";
import { getApiErrorMessage } from "@/lib/auth-error";
import {
  clearLocalSession,
  commitSession,
  readSessionSnapshot,
} from "@/lib/session-repository";
import { emitSessionUpdated } from "@/lib/session-events";

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      return publicApiClient.post<
        ApiResponse<TokenResponse>,
        ApiResponse<TokenResponse>,
        LoginRequest
      >(
        "/identity-service/api/v1/authentication/token",
        credentials,
      );
    },
    onSuccess: async (response: ApiResponse<TokenResponse>) => {
      // Lưu cặp token vào IndexedDB rồi đồng bộ access token sang cookie.
      const commitResult = await commitSession(response.data);
      if (!commitResult.cookie.ok) {
        console.error(
          "[useLogin] Token đã lưu nhưng chưa đồng bộ được cookie:",
          commitResult.cookie.error,
        );
      }
      emitSessionUpdated(commitResult.snapshot.revision, "login");
 
      toast.success("Đăng nhập thành công!");
      
      await queryClient.invalidateQueries({queryKey: PROFILE_QUERY_KEY})

      // Tải lại profile bằng session vừa đăng nhập.
      await queryClient.refetchQueries({ queryKey: PROFILE_QUERY_KEY });

      const params = new URLSearchParams(window.location.search);
      startTransition(() => {
        console.log("[use-auth] :::: params", params.get("redirect"))
        /**
         * Tải lại toàn bộ trang sau login để middleware, router cache và Server
         * Component cùng đọc session mới.
         */
        window.location.replace(params.get("redirect") ?? "/");

      console.log("[use-auth] :::: path: ", window.location.pathname);
      });
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Không thể đăng nhập."));
    },
  });
}

export function useSignup() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (values: CreateAccountRequest) => {
      return publicApiClient.post<
        ApiResponse<unknown>,
        ApiResponse<unknown>,
        CreateAccountRequest
      >("/identity-service/api/v1/accounts", values);
    },
    onSuccess: () => {
      toast.success("Đăng ký thành công! Hãy đăng nhập.");
      router.push("/signin");
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Không thể đăng ký."));
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
 
  return useMutation({
    mutationFn: async () => {
      let clearResult: Awaited<ReturnType<typeof clearLocalSession>>;

      try {
        const snapshot = await readSessionSnapshot();

        // Logout bằng refresh token; request này không cần access token.
        await publicApiClient.post<
          unknown,
          unknown,
          { refreshToken: string | undefined }
        >(
          "/identity-service/api/v1/authentication/logout",
          {
            refreshToken: snapshot?.tokenResponse.refreshToken,
          },
        );
      } catch (error) {
        // Backend lỗi vẫn phải tiếp tục xóa session trong trình duyệt.
        console.error("[useLogout] Backend logout failed:", error);
      } finally {
        // `finally` bảo đảm dữ liệu local luôn được xóa dù backend có lỗi.
        clearResult = await clearLocalSession("logout");
        queryClient.clear();
      }

      return clearResult;
    },
    onSuccess: (clearResult) => {
      if (clearResult.cleared) {
        toast.success("Đăng xuất thành công!");
      } else {
        console.error(
          "[useLogout] Không thể xóa toàn bộ session cục bộ:",
          clearResult,
        );
        toast.warning("Đã đăng xuất nhưng chưa dọn hết dữ liệu phiên cục bộ.");
      }
      router.refresh();
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Không thể đăng xuất."));
    },
  });
}
