import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import apiClient from "@/lib/api-client";
import { ApiResponse } from "@/interfaces/response/api-response.interface";
import { ProfileResponse } from "@/interfaces/response/profile-response.interface";
import { getCachedProfile, setCachedProfile } from "@/stores/profile-store";
import { getTokenResponse, isTokenExpired } from "@/stores/token-store";
import { ProfileListResponse } from "@/interfaces/response/profile-list-response.interface";
import { getApiErrorMessage } from "@/lib/auth-error";

export const PROFILE_QUERY_KEY = ["profile", "me", "profiles"];
// Tạo query key riêng cho public profile
export const PUBLIC_PROFILE_QUERY_KEY = ["profile", "public"];

export function useProfile() {
  return useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: async (): Promise<ProfileResponse | null> => {
      // Không có session → không gọi API
      const tokenResponse = await getTokenResponse();
      if (!tokenResponse) return null;

      // Token còn hạn → ưu tiên cache IndexedDB
      const tokenExpired = await isTokenExpired();
      if (!tokenExpired) {
        const cached = await getCachedProfile();
        if (cached) return cached;
      }

      // Token hết hạn hoặc chưa có cache → gọi API
      // api-client interceptor tự refresh token trước khi gửi request
      const response = await apiClient.get<never, ApiResponse<ProfileResponse>>(
        "/user-service/api/v1/profiles/me",
      );

      await setCachedProfile(response.data);
      return response.data;
    },
    // staleTime: Infinity,
    // gcTime: 10 * 60 * 1000,
    // retry: false,
    // refetchOnMount: false,
    // refetchOnWindowFocus: false,
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

// Hook lấy danh sách profiles (có phân trang)
export function useProfiles(pageNumber = 0, pageSize = 10, search?: string) {
  return useQuery({
    queryKey: [...PROFILE_QUERY_KEY, pageNumber, pageSize, search],
    queryFn: async (): Promise<ProfileListResponse | null> => {
      // Không có session → không gọi API
      const tokenResponse = await getTokenResponse();
      if (!tokenResponse) return null;

      // Gọi API
      const response = await apiClient.get<
        never,
        ApiResponse<ProfileListResponse>
      >("/user-service/api/v1/profiles", {
        params: { page: pageNumber, size: pageSize, search },
      });

      return response.data;
    },
    // staleTime: Infinity,
    // gcTime: 10 * 60 * 1000,
    // retry: false,
    // refetchOnMount: false,
    // refetchOnWindowFocus: false,
    // placeholderData: keepPreviousData
  });
}

export function usePublicProfile(publicId?: string) {
  const queryClient = useQueryClient();
  
  // Log xem cache có gì trước khi query chạy
  console.log(
    "cache state:",
    queryClient.getQueryData([...PUBLIC_PROFILE_QUERY_KEY, publicId])
  );

  return useQuery({
    queryKey: [...PUBLIC_PROFILE_QUERY_KEY, publicId],
    queryFn: async (): Promise<ProfileResponse | null> => {
      console.log("queryFn running for:", publicId);
      // Không có publicId → không gọi API
      if (!publicId) return null;

      try {
        const response = await apiClient.get<
          never,
          ApiResponse<ProfileResponse>
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
    // staleTime: 5 * 60 * 1000, // 5 phút
    // gcTime: 10 * 60 * 1000, // 10 phút
    // retry: 1,
    // refetchOnMount: false,
    // refetchOnWindowFocus: false,
  });
}

export function useProfileByAccountId(accountId: string) {
  return useQuery({
    queryKey: [...PROFILE_QUERY_KEY, accountId],
    queryFn: async (): Promise<ProfileResponse | null> => {
      if (!accountId) return null;

      const response = await apiClient.get<never, ApiResponse<ProfileResponse>>(
        `/user-service/api/v1/profiles/by-account-id/${accountId}`
      );
      return response.data;
    },
    enabled: !!accountId,
  });
}

export function usePublicInstructors(pageNumber = 0, pageSize = 10, keyword?: string) {
  return useQuery({
    queryKey: ["profiles", "instructors", pageNumber, pageSize, keyword],
    queryFn: async (): Promise<ProfileListResponse | null> => {
      const response = await apiClient.get<
        never,
        ApiResponse<ProfileListResponse>
      >("/user-service/api/v1/profiles", {
        params: {
          page: pageNumber,
          size: pageSize,
          keyword,
          profileType: "INSTRUCTOR",
        },
      });

      return response.data;
    },
  });
}
