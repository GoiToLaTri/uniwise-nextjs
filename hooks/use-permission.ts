// use-permission.ts
import { ApiResponse, ListResponse } from "@/interfaces/response";
import apiClient from "@/lib/api-client";
import { getTokenResponse } from "@/stores/token-store";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner"; // or your toast library

// Types
export interface PermissionResponse {
  id: number;
  name: string;
  description: string;
}

export interface PermissionListResponse extends ListResponse {
  content: PermissionResponse[];
}

export interface CreatePermissionRequest {
  name: string;
  description?: string;
}

export interface UpdatePermissionRequest {
  name?: string;
  description?: string;
}

// Query keys
const PERMISSIONS_QUERY_KEY = ["permissions"];
const PERMISSION_DETAIL_QUERY_KEY = (id: number) => ["permission", id];

// Hook lấy danh sách permissions (có phân trang)
export function usePermissions(pageNumber = 0, pageSize = 10, search?: string) {
  return useQuery({
    queryKey: [...PERMISSIONS_QUERY_KEY, pageNumber, pageSize, search],
    queryFn: async (): Promise<PermissionListResponse | null> => {
      // Không có session → không gọi API
      const tokenResponse = await getTokenResponse();
      if (!tokenResponse) return null;

      // Gọi API
      const response = await apiClient.get<never, ApiResponse<PermissionListResponse>>(
        "/identity-service/api/v1/permissions",
        {
          params: { page: pageNumber, size: pageSize, search },
        }
      );

      return response.data;
    },
    
  });
}

// Hook lấy chi tiết một permission
export function usePermission(id: number) {
  return useQuery({
    queryKey: PERMISSION_DETAIL_QUERY_KEY(id),
    queryFn: async (): Promise<PermissionResponse | null> => {
      if (!id) return null;

      const tokenResponse = await getTokenResponse();
      if (!tokenResponse) return null;

      const response = await apiClient.get<never, ApiResponse<PermissionResponse>>(
        `/identity-service/api/v1/permissions/${id}`
      );

      return response.data;
    },
    enabled: !!id,
  });
}

// Hook tạo mới permission
export function useCreatePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePermissionRequest): Promise<PermissionResponse | null> => {
      try {
        const response = await apiClient.post<never, ApiResponse<PermissionResponse>>(
          "/identity-service/api/v1/permissions",
          data
        );
        toast.success("Tạo permission thành công!");
        return response.data;
      } catch (error) {
        toast.error("Không thể tạo permission mới.");
        throw error;
      }
    },
    onSuccess: (newPermission) => {
      if (newPermission) {
        // Invalidate và refetch danh sách permissions
        queryClient.invalidateQueries({ queryKey: [...PERMISSIONS_QUERY_KEY, "all"] });
        
        queryClient.refetchQueries({ queryKey: [...PERMISSIONS_QUERY_KEY, "all"] });

        // Set cache chi tiết
        queryClient.setQueryData(PERMISSION_DETAIL_QUERY_KEY(newPermission.id), newPermission);
      }
    },
  });
}

// Hook cập nhật permission
export function useUpdatePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: UpdatePermissionRequest;
    }): Promise<PermissionResponse | null> => {
      try {
        const response = await apiClient.put<never, ApiResponse<PermissionResponse>>(
          `/identity-service/api/v1/permissions/${id}`,
          data
        );
        toast.success("Cập nhật permission thành công!");
        return response.data;
      } catch (error) {
        toast.error("Không thể cập nhật permission.");
        throw error;
      }
    },
    onSuccess: (updatedPermission, { id }) => {
      if (updatedPermission) {
        // Update cache chi tiết
        queryClient.setQueryData(PERMISSION_DETAIL_QUERY_KEY(id), updatedPermission);
        
        // Update trong danh sách permissions cache
        const cached = queryClient.getQueryData<PermissionListResponse>(PERMISSIONS_QUERY_KEY);
        if (cached?.content) {
          const updatedContent = cached.content.map((permission) =>
            permission.id === id ? updatedPermission : permission
          );
          queryClient.setQueryData(PERMISSIONS_QUERY_KEY, {
            ...cached,
            content: updatedContent,
          });
        } else {
          // Nếu không có cache thì invalidate
          queryClient.invalidateQueries({ queryKey: PERMISSIONS_QUERY_KEY });
        }
      }
    },
  });
}

// Hook xóa permission
export function useDeletePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number): Promise<boolean> => {
      try {
        await apiClient.delete(`/identity-service/api/v1/permissions/${id}`);
        toast.success("Xóa permission thành công!");
        return true;
      } catch (error) {
        toast.error("Không thể xóa permission.");
        throw error;
      }
    },
    onSuccess: (_, id) => {
      // Xóa khỏi cache chi tiết
      queryClient.removeQueries({ queryKey: PERMISSION_DETAIL_QUERY_KEY(id) });
      
      // Update trong danh sách permissions cache (remove khỏi list)
      const cached = queryClient.getQueryData<PermissionListResponse>(PERMISSIONS_QUERY_KEY);
      if (cached?.content) {
        const updatedContent = cached.content.filter(
          (permission) => permission.id !== id
        );
        queryClient.setQueryData(PERMISSIONS_QUERY_KEY, {
          ...cached,
          content: updatedContent,
          totalElements: cached.totalElements - 1,
        });
      } else {
        // Nếu không có cache thì invalidate
        queryClient.invalidateQueries({ queryKey: PERMISSIONS_QUERY_KEY });
      }
    },
  });
}

// Hook lấy tất cả permissions (không phân trang - dùng cho select box, v.v.)
export function useAllPermissions() {
  return useQuery({
    queryKey: [...PERMISSIONS_QUERY_KEY, "all"],
    queryFn: async (): Promise<PermissionResponse[] | null> => {
      const tokenResponse = await getTokenResponse();
      if (!tokenResponse) return null;

      // Gọi API với pageSize lớn để lấy tất cả
      const response = await apiClient.get<never, ApiResponse<PermissionListResponse>>(
        "/identity-service/api/v1/permissions",
        {
          params: { page: 0, size: 1000 }, // Hoặc size lớn hơn nếu cần
        }
      );

      return response.data?.content || [];
    },
  });
}