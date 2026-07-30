import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import publicApiClient from "@/lib/public-api-client";
import { ApiResponse } from "@/interfaces/response/api-response.interface";
import { CourseSearchListResponse } from "@/interfaces/course.interface";

export const SEARCH_PUBLISHED_COURSES_QUERY_KEY = ["search-published-courses"];

// Hook tìm kiếm các courses đã được published (Server-side search)
export function useSearchPublishedCourses(
  keyword = "",
  pageNumber = 0,
  pageSize = 10,
  enabled = true,
  instructorPublicId?: string,
) {
  return useQuery({
    queryKey: [
      ...SEARCH_PUBLISHED_COURSES_QUERY_KEY,
      keyword,
      instructorPublicId,
      pageNumber,
      pageSize,
    ],
    queryFn: async (): Promise<CourseSearchListResponse | null> => {
      const response = await publicApiClient.get<
        never,
        ApiResponse<CourseSearchListResponse>
      >("/search-service/api/v1/search/courses/published", {
        params: {
          keyword,
          instructorPublicId,
          page: pageNumber,
          size: pageSize,
        },
      });
      return response.data;
    },
    enabled,
  });
}

export const SEARCH_CREATOR_COURSES_QUERY_KEY = ["search-creator-courses"];

// Hook tìm kiếm khóa học của giảng viên (Server-side search)
export function useSearchCreatorCourses(keyword = "", status?: string, pageNumber = 0, pageSize = 10, enabled = true) {
  return useQuery({
    queryKey: [...SEARCH_CREATOR_COURSES_QUERY_KEY, keyword, status, pageNumber, pageSize],
    queryFn: async (): Promise<CourseSearchListResponse | null> => {
      // Dynamic import to avoid circular dependencies
      const { getTokenResponse } = await import("@/stores/token-store");
      const tokenResponse = await getTokenResponse();
      if (!tokenResponse) return null;

      const params: Record<string, string | number> = {
        keyword,
        page: pageNumber,
        size: pageSize,
      };
      if (status && status !== "ALL") params.status = status;

      const response = await apiClient.get<never, ApiResponse<CourseSearchListResponse>>(
        "/search-service/api/v1/search/courses/creator",
        { params }
      );
      return response.data;
    },
    enabled,
  });
}
