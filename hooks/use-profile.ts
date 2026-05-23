import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import apiClient from "@/lib/api-client";
import { ApiResponse } from "@/interfaces/response/api-response.interface";
import { ProfileResponse } from "@/interfaces/response/profile-response.interface";
import { getCachedProfile, setCachedProfile } from "@/stores/profile-store";

const PROFILE_QUERY_KEY = ["profile", "me"];

export function useProfile() {
  return useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: async (): Promise<ProfileResponse> => {
      const cached = await getCachedProfile();
      if (cached) return cached;

      const response = await apiClient.get<never, ApiResponse<ProfileResponse>>(
        "/user-service/api/v1/profiles/me",
      );

      await setCachedProfile(response.data);
      return response.data;
    },
    staleTime: Infinity,
    retry: false,
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
    } catch {
      toast.error("Không thể tải lại thông tin người dùng.");
      return null;
    }
  };
}