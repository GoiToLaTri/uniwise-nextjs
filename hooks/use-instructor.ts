import { InstructorProfile, ApplyInstructorRequest, UpdateInstructorRequest, Degree, Expertise, InstructorApplicationListResponse } from "@/interfaces/instructor.interface";
import { ApiResponse } from "@/interfaces/response";
import apiClient from "@/lib/api-client";
import { isAppApiError } from "@/lib/api-error";
import { getApiErrorMessage } from "@/lib/auth-error";
import { getTokenResponse } from "@/stores/token-store";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

const INSTRUCTOR_QUERY_KEY = ["instructor", "me"];
const INSTRUCTOR_APPLICATIONS_QUERY_KEY = ["instructor-applications"];
const INSTRUCTORS_QUERY_KEY = ["instructors"];
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
          "/user-service/api/v1/instructors/me"
        );
        return response.data;
      } catch (error: unknown) {
        // Nếu chưa đăng ký instructor, API trả về 404 hoặc lỗi
        if (isAppApiError(error) && error.httpStatus === 404) {
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
      } catch (error: unknown) {
        toast.error(getApiErrorMessage(error, "Không thể đăng ký giảng viên."));
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
          "/user-service/api/v1/instructors/me",
          data
        );
        toast.success("Cập nhật hồ sơ giảng viên thành công!");
        return response.data;
      } catch (error: unknown) {
        toast.error(
          getApiErrorMessage(error, "Không thể cập nhật hồ sơ giảng viên."),
        );
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
    isSuspended: data?.status === "SUSPENDED",
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
        "/user-service/api/v1/instructors/me"
      );

      queryClient.setQueryData(INSTRUCTOR_QUERY_KEY, response.data);
      toast.success("Đã cập nhật thông tin giảng viên!");
      return response.data;
    } catch (error: unknown) {
      toast.error(
        getApiErrorMessage(error, "Không thể tải lại thông tin giảng viên."),
      );
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
          "/user-service/api/v1/instructors/me/degrees",
          degree
        );
        toast.success("Thêm bằng cấp thành công!");
        return response.data;
      } catch (error: unknown) {
        toast.error(getApiErrorMessage(error, "Không thể thêm bằng cấp."));
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
        await apiClient.delete(`/user-service/api/v1/instructors/me/degrees/${degreeId}`);
        toast.success("Xóa bằng cấp thành công!");
        return true;
      } catch (error: unknown) {
        toast.error(getApiErrorMessage(error, "Không thể xóa bằng cấp."));
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
          "/user-service/api/v1/instructors/me/expertises",
          expertise
        );
        toast.success("Thêm chuyên môn thành công!");
        return response.data;
      } catch (error: unknown) {
        toast.error(getApiErrorMessage(error, "Không thể thêm chuyên môn."));
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
        await apiClient.delete(`/user-service/api/v1/instructors/me/expertises/${expertiseId}`);
        toast.success("Xóa chuyên môn thành công!");
        return true;
      } catch (error: unknown) {
        toast.error(getApiErrorMessage(error, "Không thể xóa chuyên môn."));
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INSTRUCTOR_QUERY_KEY });
    },
  });
}

// Hook lấy danh sách đơn đăng ký giảng viên (có phân trang và lọc theo status)
export function useInstructorApplications(
  pageNumber: number = 0,
  pageSize: number = 10,
  status?: string
) {
  return useQuery({
    queryKey: [...INSTRUCTOR_APPLICATIONS_QUERY_KEY, pageNumber, pageSize, status],
    queryFn: async (): Promise<InstructorApplicationListResponse | null> => {
      // Không có session → không gọi API
      const tokenResponse = await getTokenResponse();
      if (!tokenResponse) return null;

      // Gọi API
      const params: Record<string, string | number> = {
        page: pageNumber,
        size: pageSize,
      };
      
      if (status) {
        params.status = status;
      }

      const response = await apiClient.get<never, ApiResponse<InstructorApplicationListResponse>>(
        "/user-service/api/v1/instructors/applications",
        { params }
      );

      return response.data;
    },
  });
}

// Hook lấy chi tiết một instructor
export function useInstructorProfileByAccountId(accountId: string) {
  return useQuery({
    queryKey: [...INSTRUCTOR_QUERY_KEY, accountId],
    queryFn: async (): Promise<InstructorProfile | null> => {
      if (!accountId) return null;

      const tokenResponse = await getTokenResponse();
      if (!tokenResponse) return null;

      const response = await apiClient.get<never, ApiResponse<InstructorProfile>>(
        `/user-service/api/v1/instructors/by-account-id/${accountId}`
      );
      return response.data;
    },
    enabled: !!accountId,
  });
}

// Hook duyệt đơn đăng ký (approve)
export function useApproveInstructorApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (applicationId: string): Promise<InstructorProfile | null> => {
      try {
        const response = await apiClient.patch<never, ApiResponse<InstructorProfile>>(
          `/user-service/api/v1/instructors/applications/${applicationId}/approve`,
          {}
        );
        toast.success("Đã duyệt đơn đăng ký giảng viên!");
        return response.data;
      } catch (error: unknown) {
        toast.error(getApiErrorMessage(error, "Không thể duyệt đơn đăng ký."));
        throw error;
      }
    },
    onSuccess: (data, applicationId) => {
      if (data) {
        // Invalidate danh sách applications
        queryClient.invalidateQueries({ queryKey: INSTRUCTOR_APPLICATIONS_QUERY_KEY });
        queryClient.refetchQueries({ queryKey: INSTRUCTOR_APPLICATIONS_QUERY_KEY });
        
        // Invalidate chi tiết application
        queryClient.invalidateQueries({ queryKey: ["instructor-application", applicationId] });
        queryClient.refetchQueries({ queryKey: ["instructor-application", applicationId] });

        // Invalidate instructor profile (nếu cần)
        queryClient.invalidateQueries({ queryKey: ["instructor", "me"] });
        queryClient.refetchQueries({ queryKey: ["instructor", "me"] });
      }
    },
  });
}

// Hook từ chối đơn đăng ký (reject)
export function useRejectInstructorApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      applicationId, 
      reviewComment 
    }: { 
      applicationId: string; 
      reviewComment: string;
    }): Promise<InstructorProfile | null> => {
      try {
        const response = await apiClient.patch<never, ApiResponse<InstructorProfile>>(
          `/user-service/api/v1/instructors/applications/${applicationId}/reject`,
          { reviewComment }
        );
        toast.success("Đã từ chối đơn đăng ký giảng viên!");
        return response.data;
      } catch (error: unknown) {
        toast.error(getApiErrorMessage(error, "Không thể từ chối đơn đăng ký."));
        throw error;
      }
    },
    onSuccess: (data, { applicationId }) => {
      if (data) {
        // Invalidate danh sách applications
        queryClient.invalidateQueries({ queryKey: INSTRUCTOR_APPLICATIONS_QUERY_KEY });
        
        // Invalidate chi tiết application
        queryClient.invalidateQueries({ queryKey: ["instructor-application", applicationId] });

        queryClient.refetchQueries({ queryKey: ["instructor-application", applicationId] })
      }
    },
  });
}

// Hook tạm ngưng giảng viên (suspend)
export function useSuspendInstructor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      instructorId, 
      reviewComment 
    }: { 
      instructorId: string; 
      reviewComment: string;
    }): Promise<boolean> => {
      try {
        await apiClient.patch(
          `/user-service/api/v1/instructors/applications/${instructorId}/suspend`,
          { reviewComment }
        );
        toast.success("Đã tạm ngưng giảng viên!");
        return true;
      } catch (error: unknown) {
        toast.error(
          getApiErrorMessage(error, "Không thể tạm ngưng giảng viên."),
        );
        throw error;
      }
    },
    onSuccess: (_, instructorId) => {
      // Invalidate các query liên quan
      queryClient.invalidateQueries({ queryKey: INSTRUCTORS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: INSTRUCTOR_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["instructor", instructorId] });
      queryClient.invalidateQueries({ queryKey: INSTRUCTOR_APPLICATIONS_QUERY_KEY });
      
      // Invalidate danh sách courses của instructor (nếu có)
      queryClient.invalidateQueries({ queryKey: ["instructor-courses", instructorId] });
    },
  });
}

// Hook kích hoạt lại giảng viên (reactivate)
export function useReactivateInstructor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (instructorId: string): Promise<boolean> => {
      try {
        await apiClient.patch(
          `/user-service/api/v1/instructors/applications/${instructorId}/reactivate`,
          {}
        );
        toast.success("Đã kích hoạt lại giảng viên!");
        return true;
      } catch (error: unknown) {
        toast.error(
          getApiErrorMessage(error, "Không thể kích hoạt lại giảng viên."),
        );
        throw error;
      }
    },
    onSuccess: (_, instructorId) => {
      // Invalidate các query liên quan
      queryClient.invalidateQueries({ queryKey: INSTRUCTORS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: INSTRUCTOR_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["instructor", instructorId] });
      queryClient.invalidateQueries({ queryKey: INSTRUCTOR_APPLICATIONS_QUERY_KEY });
      
      // Invalidate danh sách courses của instructor (nếu có)
      queryClient.invalidateQueries({ queryKey: ["instructor-courses", instructorId] });
    },
  });
}

export function usePublicInstructorProfile(profileId?: string) {
  return useQuery({
    queryKey: ["instructor", "public", profileId],
    queryFn: async (): Promise<InstructorProfile | null> => {
      if (!profileId) return null;
      try {
        const response = await apiClient.get<never, ApiResponse<InstructorProfile>>(
          `/user-service/api/v1/instructors/public/${profileId}`
        );
        return response.data;
      } catch (error: unknown) {
        if (isAppApiError(error) && error.httpStatus === 404) {
          return null;
        }
        throw error;
      }
    },
    enabled: !!profileId,
  });
}
