import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { ApiResponse } from "@/interfaces/response/api-response.interface";
import { MyCoursesResponse } from "@/interfaces/course.interface";

export const useMyCourses = (page: number = 1, size: number = 12) => {
  return useQuery({
    queryKey: ["my-courses", page, size],
    queryFn: async () => {
      const response = await apiClient.get<never, ApiResponse<MyCoursesResponse>>(
        "/course-service/api/v1/learning-progress/my-courses",
        {
          params: { page, size },
        }
      );
      return response.data;
    },
  });
};
