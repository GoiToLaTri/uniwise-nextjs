import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { ApiResponse } from "@/interfaces/response/api-response.interface";
import { CourseResponse, MyCoursesResponse } from "@/interfaces/course.interface";
import { COURSE_DETAIL_QUERY_KEY } from "@/hooks/use-course";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/auth-error";

const MY_LEARNING_COURSES_QUERY_KEY = ["my-courses"];

export const useMyCourses = (page: number = 1, size: number = 12) => {
  return useQuery({
    queryKey: [...MY_LEARNING_COURSES_QUERY_KEY, page, size],
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

export const useEnrollFreeCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseId }: { courseId: string; coursePublicId: string }) => {
      await apiClient.post<never, ApiResponse<void>>(
        `/course-service/api/v1/learning-progress/courses/${courseId}/enroll-free`,
      );
    },
    onSuccess: async (_, { coursePublicId }) => {
      queryClient.setQueryData<CourseResponse | null>(
        COURSE_DETAIL_QUERY_KEY(coursePublicId),
        (currentCourse) =>
          currentCourse
            ? {
                ...currentCourse,
                isEnrolled: true,
                progressPercentage: currentCourse.progressPercentage ?? 0,
                completedLessonsCount: currentCourse.completedLessonsCount ?? 0,
              }
            : currentCourse,
      );

      await queryClient.invalidateQueries({
        queryKey: MY_LEARNING_COURSES_QUERY_KEY,
      });
      toast.success("Đăng ký khóa học miễn phí thành công!");
    },
    onError: (error: unknown) => {
      toast.error(
        getApiErrorMessage(error, "Không thể đăng ký khóa học miễn phí."),
      );
    },
  });
};

export const useSyncVideoPosition = (lessonId: string) => {
  return useMutation({
    mutationFn: async (lastWatchedPosition: number) => {
      const response = await apiClient.put<never, ApiResponse<void>>(
        `/course-service/api/v1/learning-progress/lessons/${lessonId}/sync-position`,
        { lastWatchedPosition }
      );
      return response.data;
    },
  });
};

export const useCompleteLesson = (lessonId: string, courseId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post<never, ApiResponse<void>>(
        `/course-service/api/v1/learning-progress/lessons/${lessonId}/complete`
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidate queries to update progress indicators
      queryClient.invalidateQueries({ queryKey: ["my-courses"] });
      
      // Update local cache for immediate UI feedback
      queryClient.setQueryData<CourseResponse | undefined>(["course", courseId], (oldData) => {
        if (!oldData) return oldData;
        
        let lessonsCount = 0;
        let completedCount = 0;
        
        const newSections = oldData.sections.map((section) => {
          const newLessons = section.lessons.map((lesson) => {
            lessonsCount++;
            let isCompleted = lesson.isCompleted;
            if (lesson.id === lessonId) {
              isCompleted = true;
            }
            if (isCompleted) {
              completedCount++;
            }
            return { ...lesson, isCompleted };
          });
          return { ...section, lessons: newLessons };
        });
        
        const newProgress = lessonsCount > 0 ? Math.round((completedCount / lessonsCount) * 100) : 0;
        
        return {
          ...oldData,
          sections: newSections,
          progressPercentage: newProgress
        };
      });
      
      // Also invalidate to fetch fresh data in background
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
    },
  });
};
