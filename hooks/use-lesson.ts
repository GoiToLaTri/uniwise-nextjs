import { ApiResponse } from "@/interfaces/response";
import apiClient from "@/lib/api-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  CreateLessonRequest,
  UpdateLessonRequest,
  CourseLesson,
} from "@/interfaces/course.interface";
import { COURSE_DETAIL_QUERY_KEY } from "./use-course";
import { getApiErrorMessage } from "@/lib/auth-error";

// Hook tạo bài giảng mới
export function useCreateLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: {
      courseId: string;
      data: CreateLessonRequest;
    }): Promise<CourseLesson> => {
      try {
        const response = await apiClient.post<never, ApiResponse<CourseLesson>>(
          "/course-service/api/v1/lessons",
          variables.data
        );
        toast.success("Tạo bài giảng mới thành công!");
        return response.data;
      } catch (error: unknown) {
        toast.error(getApiErrorMessage(error, "Không thể tạo bài giảng mới."));
        throw error;
      }
    },
    onSuccess: (_, { courseId }) => {
      queryClient.invalidateQueries({ queryKey: COURSE_DETAIL_QUERY_KEY(courseId) });
    },
  });
}

// Hook cập nhật bài giảng
export function useUpdateLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: {
      id: string; // publicId hoặc id của lesson
      courseId: string;
      data: UpdateLessonRequest;
    }): Promise<CourseLesson> => {
      try {
        const response = await apiClient.put<never, ApiResponse<CourseLesson>>(
          `/course-service/api/v1/lessons/${variables.id}`,
          variables.data
        );
        toast.success("Cập nhật bài giảng thành công!");
        return response.data;
      } catch (error: unknown) {
        toast.error(getApiErrorMessage(error, "Không thể cập nhật bài giảng."));
        throw error;
      }
    },
    onSuccess: (_, { courseId }) => {
      queryClient.invalidateQueries({ queryKey: COURSE_DETAIL_QUERY_KEY(courseId) });
    },
  });
}

// Hook xóa bài giảng
export function useDeleteLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: {
      id: string;
      courseId: string;
    }): Promise<boolean> => {
      try {
        await apiClient.delete(`/course-service/api/v1/lessons/${variables.id}`);
        toast.success("Xóa bài giảng thành công!");
        return true;
      } catch (error: unknown) {
        toast.error(getApiErrorMessage(error, "Không thể xóa bài giảng."));
        throw error;
      }
    },
    onSuccess: (_, { courseId }) => {
      queryClient.invalidateQueries({ queryKey: COURSE_DETAIL_QUERY_KEY(courseId) });
    },
  });
}

// Hook reorder lessons
export function useReorderLessons() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: {
      sectionDbId: string;
      courseId: string;
      data: { items: { id: string; sortOrder: number }[] };
    }): Promise<boolean> => {
      try {
        await apiClient.put(
          `/course-service/api/v1/lessons/section/${variables.sectionDbId}/reorder`,
          variables.data
        );
        toast.success("Cập nhật thứ tự bài giảng thành công!");
        return true;
      } catch (error: unknown) {
        toast.error(
          getApiErrorMessage(error, "Không thể cập nhật thứ tự bài giảng."),
        );
        throw error;
      }
    },
    onSuccess: (_, { courseId }) => {
      queryClient.invalidateQueries({ queryKey: COURSE_DETAIL_QUERY_KEY(courseId) });
    },
  });
}
