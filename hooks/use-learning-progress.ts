import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
      queryClient.setQueryData(["course", courseId], (oldData: any) => {
        if (!oldData) return oldData;
        
        let lessonsCount = 0;
        let completedCount = 0;
        
        const newSections = oldData.sections?.map((section: any) => {
          const newLessons = section.lessons?.map((lesson: any) => {
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
