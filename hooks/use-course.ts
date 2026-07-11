import { ApiResponse } from "@/interfaces/response";
import apiClient from "@/lib/api-client";
import { getTokenResponse } from "@/stores/token-store";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  CourseResponse,
  CourseListResponse,
  CreateCourseRequest,
  UpdateCourseRequest,
} from "@/interfaces/course.interface";

export const COURSES_QUERY_KEY = ["courses"];
export const MY_COURSES_QUERY_KEY = ["my-courses"];
export const COURSE_DETAIL_QUERY_KEY = (id: string) => ["course", id];
export const PUBLISHED_COURSES_QUERY_KEY = ["published-courses"];

// Hook lấy danh sách các courses đã được published (dành cho trang chủ/public)
export function usePublishedCourses(pageNumber = 0, pageSize = 10, sortBy = "createdAt", sortDir = "desc", enabled = true) {
  return useQuery({
    queryKey: [...PUBLISHED_COURSES_QUERY_KEY, pageNumber, pageSize, sortBy, sortDir],
    queryFn: async (): Promise<CourseListResponse | null> => {
      const response = await apiClient.get<never, ApiResponse<CourseListResponse>>(
        "/course-service/api/v1/courses/published",
        {
          params: {
            page: pageNumber,
            size: pageSize,
            sortBy,
            sortDir,
          },
        }
      );
      return response.data;
    },
    enabled,
  });
}

// Hook lấy danh sách tất cả các courses (có phân trang, tìm kiếm & lọc theo trạng thái)
export function useCourses(pageNumber = 0, pageSize = 10, search?: string, status?: string) {
  return useQuery({
    queryKey: [...COURSES_QUERY_KEY, pageNumber, pageSize, search, status],
    queryFn: async (): Promise<CourseListResponse | null> => {
      // Không có session → không gọi API
      const tokenResponse = await getTokenResponse();
      if (!tokenResponse) return null;

      const params: Record<string, any> = { page: pageNumber, size: pageSize };
      if (search) params.search = search;
      if (status && status !== "ALL") params.status = status;

      // Gọi API
      const response = await apiClient.get<never, ApiResponse<CourseListResponse>>(
        "/course-service/api/v1/courses",
        { params }
      );

      return response.data;
    },
  });
}

// Hook lấy danh sách courses của tôi (do giảng viên hiện tại tạo - có phân trang, tìm kiếm & lọc theo trạng thái)
export function useMyCourses(pageNumber = 0, pageSize = 10, search?: string, status?: string) {
  return useQuery({
    queryKey: [...MY_COURSES_QUERY_KEY, pageNumber, pageSize, search, status],
    queryFn: async (): Promise<CourseListResponse | null> => {
      // Không có session → không gọi API
      const tokenResponse = await getTokenResponse();
      if (!tokenResponse) return null;

      const params: Record<string, any> = { page: pageNumber, size: pageSize };
      if (search) params.keyword = search;
      if (status && status !== "ALL") params.status = status;

      // Gọi API
      const response = await apiClient.get<never, ApiResponse<CourseListResponse>>(
        "/course-service/api/v1/courses/me",
        { params }
      );

      return response.data;
    },
  });
}

// Hook lấy chi tiết một course
export function useCourse(id: string) {
  return useQuery({
    queryKey: COURSE_DETAIL_QUERY_KEY(id),
    queryFn: async (): Promise<CourseResponse | null> => {
      if (!id) return null;

      const response = await apiClient.get<never, ApiResponse<CourseResponse>>(
        `/course-service/api/v1/courses/${id}`
      );

      return response.data;
    },
    enabled: !!id,
  });
}

// Hook tạo mới một course
export function useCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCourseRequest): Promise<CourseResponse | null> => {
      try {
        const response = await apiClient.post<never, ApiResponse<CourseResponse>>(
          "/course-service/api/v1/courses",
          data
        );
        toast.success("Tạo khóa học thành công!");
        return response.data;
      } catch (error: any) {
        const message = error?.response?.data?.message || "Không thể tạo khóa học mới.";
        toast.error(message);
        throw error;
      }
    },
    onSuccess: (newCourse) => {
      if (newCourse) {
        // Invalidate danh sách các courses
        queryClient.invalidateQueries({ queryKey: COURSES_QUERY_KEY });
        queryClient.invalidateQueries({ queryKey: MY_COURSES_QUERY_KEY });

        // Ghi cache cho chi tiết khóa học mới
        queryClient.setQueryData(COURSE_DETAIL_QUERY_KEY(newCourse.publicId), newCourse);
      }
    },
  });
}

// Hook cập nhật thông tin một course
export function useUpdateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string; // Đây là publicId để gửi lên api
      data: UpdateCourseRequest;
    }): Promise<CourseResponse | null> => {
      try {
        const response = await apiClient.put<never, ApiResponse<CourseResponse>>(
          `/course-service/api/v1/courses/${id}`,
          data
        );
        toast.success("Cập nhật khóa học thành công!");
        return response.data;
      } catch (error: any) {
        const message = error?.response?.data?.message || "Không thể cập nhật khóa học.";
        toast.error(message);
        throw error;
      }
    },
    onSuccess: (updatedCourse) => {
      if (updatedCourse) {
        // Invalidate danh sách các courses
        queryClient.invalidateQueries({ queryKey: COURSES_QUERY_KEY });
        queryClient.invalidateQueries({ queryKey: MY_COURSES_QUERY_KEY });

        // Cập nhật lại cache cho chi tiết khóa học
        queryClient.setQueryData(COURSE_DETAIL_QUERY_KEY(updatedCourse.publicId), updatedCourse);
      }
    },
  });
}

// Hook xóa một course
export function useDeleteCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<boolean> => { // Đây là publicId
      try {
        await apiClient.delete(`/course-service/api/v1/courses/${id}`);
        toast.success("Xóa khóa học thành công!");
        return true;
      } catch (error: any) {
        const message = error?.response?.data?.message || "Không thể xóa khóa học.";
        toast.error(message);
        throw error;
      }
    },
    onSuccess: (_, id) => {
      // Invalidate danh sách và chi tiết course
      queryClient.invalidateQueries({ queryKey: COURSES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: MY_COURSES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: COURSE_DETAIL_QUERY_KEY(id) });
    },
  });
}
