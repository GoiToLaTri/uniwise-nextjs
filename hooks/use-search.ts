import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { ApiResponse } from "@/interfaces/response/api-response.interface";
import { CourseListResponse } from "@/interfaces/course.interface";

export const SEARCH_PUBLISHED_COURSES_QUERY_KEY = ["search-published-courses"];

// Hook tìm kiếm các courses đã được published (Server-side search)
export function useSearchPublishedCourses(keyword = "", pageNumber = 0, pageSize = 10, enabled = true) {
  return useQuery({
    queryKey: [...SEARCH_PUBLISHED_COURSES_QUERY_KEY, keyword, pageNumber, pageSize],
    queryFn: async (): Promise<CourseListResponse | null> => {
      const response = await apiClient.get<never, ApiResponse<CourseListResponse>>(
        "/search-service/api/v1/search/courses/published",
        {
          params: {
            keyword,
            page: pageNumber,
            size: pageSize,
          },
        }
      );
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
    queryFn: async (): Promise<CourseListResponse | null> => {
      // Dynamic import to avoid circular dependencies
      const { getTokenResponse } = await import("@/stores/token-store");
      const tokenResponse = await getTokenResponse();
      if (!tokenResponse) return null;

      const params: Record<string, any> = { keyword, page: pageNumber, size: pageSize };
      if (status && status !== "ALL") params.status = status;

      const response = await apiClient.get<never, ApiResponse<CourseListResponse>>(
        "/search-service/api/v1/search/courses/creator",
        { params }
      );
      return response.data;
    },
    enabled,
  });
}
