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
