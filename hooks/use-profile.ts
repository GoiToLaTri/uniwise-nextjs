import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import apiClient from "@/lib/api-client";
import { ApiResponse } from "@/interfaces/response/api-response.interface";
import { ProfileResponse } from "@/interfaces/response/profile-response.interface";
import { PublicProfileResponse } from "@/interfaces/response/public-profile-response.interface";
import { getCachedProfile, setCachedProfile } from "@/stores/profile-store";
import { getTokenResponse, isTokenExpired } from "@/stores/token-store";
import { ProfileListResponse } from "@/interfaces/response/profile-list-response.interface";
import { getApiErrorMessage } from "@/lib/auth-error";
import publicApiClient from "@/lib/public-api-client";

/** Profile đầy đủ của tài khoản đang đăng nhập. */
export const PROFILE_QUERY_KEY = ["profile", "me"] as const;

/** Danh sách profile đầy đủ, chỉ dùng cho Admin. */
export const ADMIN_PROFILE_LIST_QUERY_KEY = ["profiles", "admin"] as const;

/** Profile được tra bằng publicId. */
export const PUBLIC_PROFILE_QUERY_KEY = ["profile", "public"] as const;

/** Profile được tra bằng accountId trên endpoint có bảo vệ. */
export const PROFILE_BY_ACCOUNT_ID_QUERY_KEY = [
  "profile",
  "by-account-id",
] as const;

export function useProfile() {
  return useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: async (): Promise<ProfileResponse | null> => {
      const tokenResponse = await getTokenResponse();
      if (!tokenResponse) return null;

      const tokenExpired = await isTokenExpired();
      if (!tokenExpired) {
        const cached = await getCachedProfile();
        if (cached) return cached;
      }

      const response = await apiClient.get<never, ApiResponse<ProfileResponse>>(
        "/user-service/api/v1/profiles/me",
      );

      await setCachedProfile(response.data);
      return response.data;
    },
  });
}

export function useRefreshProfile() {
  const queryClient = useQueryClient();

  return async (): Promise<ProfileResponse | null> => {
    try {
      const response = await apiClient.get<never, ApiResponse<ProfileResponse>>(
        "/user-service/api/v1/profiles/me",
      );

      await setCachedProfile(response.data);
      queryClient.setQueryData(PROFILE_QUERY_KEY, response.data);

      return response.data;
    } catch (error: unknown) {
      toast.error(
        getApiErrorMessage(error, "Không thể tải lại thông tin người dùng."),
      );
      return null;
    }
  };
}

/** Lấy danh sách profile đầy đủ cho giao diện Admin. */
export function useProfiles(pageNumber = 0, pageSize = 10, search?: string) {
  return useQuery({
    queryKey: [
      ...ADMIN_PROFILE_LIST_QUERY_KEY,
      pageNumber,
      pageSize,
      search,
    ],
    queryFn: async (): Promise<ProfileListResponse | null> => {
      const tokenResponse = await getTokenResponse();
      if (!tokenResponse) return null;

      const response = await apiClient.get<
        never,
        ApiResponse<ProfileListResponse>
      >("/user-service/api/v1/profiles", {
        params: { page: pageNumber, size: pageSize, search },
      });

      return response.data;
    },
  });
}
export function usePublicProfile(publicId?: string) {
  return useQuery({
    queryKey: [...PUBLIC_PROFILE_QUERY_KEY, publicId],
    queryFn: async (): Promise<PublicProfileResponse | null> => {
      if (!publicId) return null;

      try {
        const response = await publicApiClient.get<
          never,
          ApiResponse<PublicProfileResponse>
        >(`/user-service/api/v1/profiles/public/${publicId}`);

        return response.data;
      } catch (error: unknown) {
        toast.error(
          getApiErrorMessage(error, "Không thể tải thông tin người dùng."),
        );
        throw error;
      }
    },
    enabled: !!publicId,
  });
}

export function useProfileByAccountId(accountId: string) {
  return useQuery({
    queryKey: [...PROFILE_BY_ACCOUNT_ID_QUERY_KEY, accountId],
    queryFn: async (): Promise<PublicProfileResponse | null> => {
      if (!accountId) return null;

      // Endpoint này yêu cầu đăng nhập; trang public sẽ dùng fallback nếu chưa
      // có session thay vì gửi một request chắc chắn nhận 401.
      const tokenResponse = await getTokenResponse();
      if (!tokenResponse) return null;

      const response = await apiClient.get<
        never,
        ApiResponse<PublicProfileResponse>
      >(`/user-service/api/v1/profiles/by-account-id/${accountId}`);
      return response.data;
    },
    enabled: !!accountId,
  });
}
