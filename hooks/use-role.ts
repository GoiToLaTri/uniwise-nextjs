import { CreateRoleRequest, UpdateRoleRequest } from "@/app/(admin)/admin/roles/_interfaces";
import { ApiResponse, RoleListResponse, RoleResponse } from "@/interfaces/response";
import apiClient from "@/lib/api-client";
import { getTokenResponse } from "@/stores/token-store";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { PermissionResponse } from "./use-permission";

const ROLES_QUERY_KEY = ["roles"];
const ROLE_DETAIL_QUERY_KEY = (id: number) => ["role", id];
const ROLE_PERMISSIONS_QUERY_KEY = (roleId: number) => ["role-permissions", roleId];
// Hook lấy danh sách roles (có phân trang)
export function useRoles(pageNumber = 0, pageSize = 10, search?: string) {
  return useQuery({
    queryKey: [...ROLES_QUERY_KEY, pageNumber, pageSize, search],
    queryFn: async (): Promise<RoleListResponse | null> => {
      // Không có session → không gọi API
      const tokenResponse = await getTokenResponse();
      if (!tokenResponse) return null;

      // Gọi API
      const response = await apiClient.get<never, ApiResponse<RoleListResponse>>(
        "/identity-service/api/v1/roles",
        {
          params: { page:pageNumber, size:pageSize, search },
        }
      );

      return response.data;
    },
    staleTime: Infinity,
    retry: false,
  });
}

// Hook lấy chi tiết một role
export function useRole(id: number) {
  return useQuery({
    queryKey: ROLE_DETAIL_QUERY_KEY(id),
    queryFn: async (): Promise<RoleResponse | null> => {
      if (!id) return null;

      const tokenResponse = await getTokenResponse();
      if (!tokenResponse) return null;

      const response = await apiClient.get<never, ApiResponse<RoleResponse>>(
        `/identity-service/api/v1/roles/${id}`
      );

      return response.data;
    },
    enabled: !!id,
    staleTime: Infinity,
    retry: false,
  });
}

// Hook tạo mới role
export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateRoleRequest): Promise<RoleResponse | null> => {
      try {
        const response = await apiClient.post<never, ApiResponse<RoleResponse>>(
          "/identity-service/api/v1/roles",
          data
        );
        toast.success("Tạo role thành công!");
        return response.data;
      } catch (error) {
        toast.error("Không thể tạo role mới.");
        throw error;
      }
    },
    onSuccess: (newRole) => {
      if (newRole) {
        // Invalidate và refetch danh sách roles
        queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEY });
        
        // Set cache chi tiết
        queryClient.setQueryData(ROLE_DETAIL_QUERY_KEY(newRole.id), newRole);
      }
    },
  });
}

// Hook cập nhật role
export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: UpdateRoleRequest;
    }): Promise<RoleResponse | null> => {
      try {
        const response = await apiClient.put<never, ApiResponse<RoleResponse>>(
          `/identity-service/api/v1/roles/${id}`,
          data
        );
        toast.success("Cập nhật role thành công!");
        return response.data;
      } catch (error) {
        toast.error("Không thể cập nhật role.");
        throw error;
      }
    },
    onSuccess: (updatedRole, { id }) => {
      if (updatedRole) {
        // Update cache chi tiết
        queryClient.setQueryData(ROLE_DETAIL_QUERY_KEY(id), updatedRole);
        
        // Invalidate danh sách roles
        queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEY });
      }
    },
  });
}

// Hook xóa role
export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number): Promise<boolean> => {
      try {
        await apiClient.delete(`/identity-service/api/v1/roles/${id}`);
        toast.success("Xóa role thành công!");
        return true;
      } catch (error) {
        toast.error("Không thể xóa role.");
        throw error;
      }
    },
    onSuccess: (_, id) => {
      // Xóa khỏi cache chi tiết
      queryClient.removeQueries({ queryKey: ROLE_DETAIL_QUERY_KEY(id) });
      
      // Invalidate danh sách roles
      queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEY });
    },
  });
}

// Hook toggle active status
export function useToggleRoleActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number): Promise<RoleResponse | null> => {
      try {
        const response = await apiClient.patch<never, ApiResponse<RoleResponse>>(
          `/identity-service/api/v1/roles/${id}/toggle-active`
        );
        toast.success(
          response.data.isActive ? "Kích hoạt role thành công!" : "Vô hiệu hóa role thành công!"
        );
        return response.data;
      } catch (error) {
        toast.error("Không thể thay đổi trạng thái role.");
        throw error;
      }
    },
    onSuccess: (updatedRole, id) => {
      if (updatedRole) {
        // Update cache chi tiết
        queryClient.setQueryData(ROLE_DETAIL_QUERY_KEY(id), updatedRole);
        
        // Update trong danh sách roles cache
        const cached = queryClient.getQueryData<RoleListResponse>(ROLES_QUERY_KEY);
        if (cached?.content) {
          const updatedContent = cached.content.map((role) =>
            role.id === id ? updatedRole : role
          );
          queryClient.setQueryData(ROLES_QUERY_KEY, {
            ...cached,
            content: updatedContent,
          });
        } else {
          // Nếu không có cache thì invalidate
          queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEY });
        }
      }
    },
  });
}

// Hook refresh roles
// export function useRefreshRoles() {
//   const queryClient = useQueryClient();

//   return async (pageNumber = 0, pageSize = 10, search?: string): Promise<RoleListResponse | null> => {
//     try {
//       const response = await apiClient.get<never, ApiResponse<RoleListResponse>>(
//         "/identity-service/api/v1/roles",
//         {
//           params: { pageNumber, pageSize, search },
//         }
//       );

//       queryClient.setQueryData([...ROLES_QUERY_KEY, pageNumber, pageSize, search], response.data);

//       toast.success("Tải lại danh sách role thành công!");
//       return response.data;
//     } catch {
//       toast.error("Không thể tải lại danh sách role.");
//       return null;
//     }
//   };
// }

// Hook refresh single role
// export function useRefreshRole() {
//   const queryClient = useQueryClient();

//   return async (id: number): Promise<RoleResponse | null> => {
//     try {
//       const response = await apiClient.get<never, ApiResponse<RoleResponse>>(
//         `/identity-service/api/v1/roles/${id}`
//       );

//       // Update cache
//       queryClient.setQueryData(ROLE_DETAIL_QUERY_KEY(id), response.data);
      
//       // Also update in list cache if exists
//       const cachedList = queryClient.getQueryData<RoleListResponse>(ROLES_QUERY_KEY);
//       if (cachedList?.content) {
//         const updatedContent = cachedList.content.map((role) =>
//           role.id === id ? response.data : role
//         );
//         queryClient.setQueryData(ROLES_QUERY_KEY, {
//           ...cachedList,
//           content: updatedContent,
//         });
//       }

//       toast.success("Tải lại thông tin role thành công!");
//       return response.data;
//     } catch {
//       toast.error("Không thể tải lại thông tin role.");
//       return null;
//     }
//   };
// }

// Hook lấy danh sách permissions của role
export function useRolePermissions(roleId: number) {
  return useQuery({
    queryKey: ROLE_PERMISSIONS_QUERY_KEY(roleId),
    queryFn: async (): Promise<RoleResponse | null> => {
      if (!roleId) return null;

      const tokenResponse = await getTokenResponse();
      if (!tokenResponse) return null;

      const response = await apiClient.get<never, ApiResponse<RoleResponse>>(
        `/identity-service/api/v1/roles/${roleId}`
      );

      return response.data;
    },
    enabled: !!roleId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });
}

// Hook cấp quyền cho role (nhận mảng tên quyền)
export function useAssignPermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      roleId,
      permissionNames,
    }: {
      roleId: number;
      permissionNames: string[]; // Mảng tên quyền (permission names)
    }): Promise<PermissionResponse[] | null> => {
      try {
        const response = await apiClient.post<never, ApiResponse<PermissionResponse[]>>(
          `/identity-service/api/v1/roles/${roleId}/assign-permissions`,
          permissionNames // Gửi mảng tên quyền
        );
        toast.success(`Đã cấp ${permissionNames.length} quyền thành công!`);
        return response.data;
      } catch (error) {
        toast.error("Không thể cấp quyền cho vai trò.");
        throw error;
      }
    },
    onSuccess: (data, { roleId }) => {
      if (data) {
        // Invalidate và refetch permissions của role
        queryClient.invalidateQueries({ queryKey: ROLE_PERMISSIONS_QUERY_KEY(roleId) });
        
        // Optional: Invalidate danh sách tất cả permissions nếu có
        queryClient.invalidateQueries({ queryKey: ["permissions"] });
      }
    },
  });
}

// Hook thu hồi quyền của role (nhận mảng tên quyền)
export function useRevokePermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      roleId,
      permissionNames,
    }: {
      roleId: number;
      permissionNames: string[]; // Mảng tên quyền (permission names)
    }): Promise<PermissionResponse[] | null> => {
      try {
        const response = await apiClient.post<never, ApiResponse<PermissionResponse[]>>(
          `/identity-service/api/v1/roles/${roleId}/revoke-permissions`,
          permissionNames // Gửi mảng tên quyền
        );
        toast.success(`Đã thu hồi ${permissionNames.length} quyền thành công!`);
        return response.data;
      } catch (error) {
        toast.error("Không thể thu hồi quyền của vai trò.");
        throw error;
      }
    },
    onSuccess: (data, { roleId }) => {
      if (data) {
        // Invalidate và refetch permissions của role
        queryClient.invalidateQueries({ queryKey: ROLE_PERMISSIONS_QUERY_KEY(roleId) });
      }
    },
  });
}