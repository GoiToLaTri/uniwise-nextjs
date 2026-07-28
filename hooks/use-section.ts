import { ApiResponse } from "@/interfaces/response";
import apiClient from "@/lib/api-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  CreateSectionRequest,
  UpdateSectionRequest,
  CourseSection,
} from "@/interfaces/course.interface";
import { COURSE_DETAIL_QUERY_KEY } from "./use-course";
import { getApiErrorMessage } from "@/lib/auth-error";

// Hook tạo mới một section
export function useCreateSection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: {
      courseId: string;
      data: CreateSectionRequest;
    }): Promise<CourseSection> => {
      try {
        const response = await apiClient.post<never, ApiResponse<CourseSection>>(
          "/course-service/api/v1/sections",
          variables.data
        );
        toast.success("Tạo chương học mới thành công!");
        return response.data;
      } catch (error: unknown) {
        toast.error(getApiErrorMessage(error, "Không thể tạo chương học mới."));
        throw error;
      }
    },
    onSuccess: (_, { courseId }) => {
      // Invalidate chi tiết course để lấy lại danh sách sections mới
      queryClient.invalidateQueries({ queryKey: COURSE_DETAIL_QUERY_KEY(courseId) });
    },
  });
}

// Hook cập nhật section
export function useUpdateSection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: {
      id: string; // publicId hoặc id của section
      courseId: string;
      data: UpdateSectionRequest;
    }): Promise<CourseSection> => {
      try {
        const response = await apiClient.put<never, ApiResponse<CourseSection>>(
          `/course-service/api/v1/sections/${variables.id}`,
          variables.data
        );
        toast.success("Cập nhật chương học thành công!");
        return response.data;
      } catch (error: unknown) {
        toast.error(getApiErrorMessage(error, "Không thể cập nhật chương học."));
        throw error;
      }
    },
    onSuccess: (_, { courseId }) => {
      queryClient.invalidateQueries({ queryKey: COURSE_DETAIL_QUERY_KEY(courseId) });
    },
  });
}

// Hook xóa section
export function useDeleteSection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: {
      id: string; // publicId hoặc id của section
      courseId: string;
    }): Promise<boolean> => {
      try {
        await apiClient.delete(`/course-service/api/v1/sections/${variables.id}`);
        toast.success("Xóa chương học thành công!");
        return true;
      } catch (error: unknown) {
        toast.error(getApiErrorMessage(error, "Không thể xóa chương học."));
        throw error;
      }
    },
    onSuccess: (_, { courseId }) => {
      queryClient.invalidateQueries({ queryKey: COURSE_DETAIL_QUERY_KEY(courseId) });
    },
  });
}

// Hook reorder sections
export function useReorderSections() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: {
      courseId: string;
      data: { items: { id: string; sortOrder: number }[] };
    }): Promise<boolean> => {
      try {
        await apiClient.put(
          `/course-service/api/v1/sections/course/${variables.courseId}/reorder`,
          variables.data
        );
        toast.success("Cập nhật thứ tự chương học thành công!");
        return true;
      } catch (error: unknown) {
        toast.error(
          getApiErrorMessage(error, "Không thể cập nhật thứ tự chương học."),
        );
        throw error;
      }
    },
    onSuccess: (_, { courseId }) => {
      queryClient.invalidateQueries({ queryKey: COURSE_DETAIL_QUERY_KEY(courseId) });
    },
  });
}
