import { InstructorProfile, ApplyInstructorRequest, UpdateInstructorRequest, Degree, Expertise } from "@/interfaces/instructor.interface";
import { ApiResponse } from "@/interfaces/response";
import apiClient from "@/lib/api-client";
import { getTokenResponse } from "@/stores/token-store";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

const INSTRUCTOR_QUERY_KEY = ["instructor", "me"];

// Hook lấy thông tin instructor hiện tại
export function useInstructorProfile() {
  return useQuery({
    queryKey: INSTRUCTOR_QUERY_KEY,
    queryFn: async (): Promise<InstructorProfile | null> => {
      // Không có session → không gọi API
      const tokenResponse = await getTokenResponse();
      if (!tokenResponse) return null;

      try {
        const response = await apiClient.get<never, ApiResponse<InstructorProfile>>(
          "/api/v1/instructors/me"
        );
        return response.data;
      } catch (error: any) {
        // Nếu chưa đăng ký instructor, API trả về 404 hoặc lỗi
        if (error?.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },
  });
}

// Hook đăng ký trở thành instructor
export function useApplyInstructor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ApplyInstructorRequest): Promise<InstructorProfile | null> => {
      try {
        const response = await apiClient.post<never, ApiResponse<InstructorProfile>>(
          "/user-service/api/v1/instructors/apply",
          data
        );
        toast.success("Đăng ký giảng viên thành công! Vui lòng chờ xét duyệt.");
        return response.data;
      } catch (error: any) {
        const message = error?.response?.data?.message || "Không thể đăng ký giảng viên.";
        toast.error(message);
        throw error;
      }
    },
    onSuccess: (data) => {
      if (data) {
        // Cập nhật cache
        queryClient.setQueryData(INSTRUCTOR_QUERY_KEY, data);
        
        // Invalidate các query liên quan
        queryClient.invalidateQueries({ queryKey: ["instructors"] });
      }
    },
  });
}

// Hook cập nhật thông tin instructor
export function useUpdateInstructorProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateInstructorRequest): Promise<InstructorProfile | null> => {
      try {
        const response = await apiClient.put<never, ApiResponse<InstructorProfile>>(
          "/api/v1/instructors/me",
          data
        );
        toast.success("Cập nhật hồ sơ giảng viên thành công!");
        return response.data;
      } catch (error: any) {
        const message = error?.response?.data?.message || "Không thể cập nhật hồ sơ giảng viên.";
        toast.error(message);
        throw error;
      }
    },
    onSuccess: (data) => {
      if (data) {
        // Cập nhật cache
        queryClient.setQueryData(INSTRUCTOR_QUERY_KEY, data);
        
        // Invalidate các query liên quan
        queryClient.invalidateQueries({ queryKey: ["instructors"] });
      }
    },
  });
}

// Hook kiểm tra trạng thái instructor
export function useInstructorStatus() {
  const { data, isLoading, error } = useInstructorProfile();
  
  return {
    status: data?.status || null,
    isPending: data?.status === "PENDING",
    isApproved: data?.status === "APPROVED",
    isRejected: data?.status === "REJECTED",
    isInactive: data?.status === "INACTIVE",
    hasApplied: !!data,
    reviewComment: data?.reviewComment,
    isLoading,
    error,
    profile: data,
  };
}

// Hook refresh instructor profile
export function useRefreshInstructorProfile() {
  const queryClient = useQueryClient();

  return async (): Promise<InstructorProfile | null> => {
    try {
      const tokenResponse = await getTokenResponse();
      if (!tokenResponse) return null;

      const response = await apiClient.get<never, ApiResponse<InstructorProfile>>(
        "/api/v1/instructors/me"
      );

      queryClient.setQueryData(INSTRUCTOR_QUERY_KEY, response.data);
      toast.success("Đã cập nhật thông tin giảng viên!");
      return response.data;
    } catch (error) {
      toast.error("Không thể tải lại thông tin giảng viên.");
      return null;
    }
  };
}

// Hook thêm degree mới (nếu cần API riêng)
export function useAddDegree() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (degree: Omit<Degree, "id">): Promise<Degree> => {
      try {
        const response = await apiClient.post<never, ApiResponse<Degree>>(
          "/api/v1/instructors/me/degrees",
          degree
        );
        toast.success("Thêm bằng cấp thành công!");
        return response.data;
      } catch (error) {
        toast.error("Không thể thêm bằng cấp.");
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate profile để lấy dữ liệu mới
      queryClient.invalidateQueries({ queryKey: INSTRUCTOR_QUERY_KEY });
    },
  });
}

// Hook xóa degree
export function useDeleteDegree() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (degreeId: string): Promise<boolean> => {
      try {
        await apiClient.delete(`/api/v1/instructors/me/degrees/${degreeId}`);
        toast.success("Xóa bằng cấp thành công!");
        return true;
      } catch (error) {
        toast.error("Không thể xóa bằng cấp.");
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INSTRUCTOR_QUERY_KEY });
    },
  });
}

// Hook thêm expertise mới
export function useAddExpertise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (expertise: Omit<Expertise, "id">): Promise<Expertise> => {
      try {
        const response = await apiClient.post<never, ApiResponse<Expertise>>(
          "/api/v1/instructors/me/expertises",
          expertise
        );
        toast.success("Thêm chuyên môn thành công!");
        return response.data;
      } catch (error) {
        toast.error("Không thể thêm chuyên môn.");
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INSTRUCTOR_QUERY_KEY });
    },
  });
}

// Hook xóa expertise
export function useDeleteExpertise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (expertiseId: string): Promise<boolean> => {
      try {
        await apiClient.delete(`/api/v1/instructors/me/expertises/${expertiseId}`);
        toast.success("Xóa chuyên môn thành công!");
        return true;
      } catch (error) {
        toast.error("Không thể xóa chuyên môn.");
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INSTRUCTOR_QUERY_KEY });
    },
  });
}