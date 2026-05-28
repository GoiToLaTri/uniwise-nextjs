// use-account.ts
import { ApiResponse, ListResponse, RoleResponse } from "@/interfaces/response";
import apiClient from "@/lib/api-client";
import { getTokenResponse } from "@/stores/token-store";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner"; // or your toast library
import { ROLES_QUERY_KEY } from "./use-role";

export interface AccountResponse {
  id: string;
  email: string;
  provider: string;
  roles: RoleResponse[];
}

export interface AccountListResponse extends ListResponse {
  content: AccountResponse[];
}

// Query keys
export const ACCOUNTS_QUERY_KEY = ["accounts"];
export const ACCOUNT_DETAIL_QUERY_KEY = (id: string) => ["account", id];

// Hook lấy danh sách accounts (có phân trang)
export function useAccounts(pageNumber = 0, pageSize = 10, search?: string) {
  return useQuery({
    queryKey: [...ACCOUNTS_QUERY_KEY, pageNumber, pageSize, search],
    queryFn: async (): Promise<AccountListResponse | null> => {
      // Không có session → không gọi API
      const tokenResponse = await getTokenResponse();
      if (!tokenResponse) return null;

      // Gọi API
      const response = await apiClient.get<never, ApiResponse<AccountListResponse>>(
        "/identity-service/api/v1/accounts",
        {
          params: { page: pageNumber, size: pageSize, search },
        }
      );

      return response.data;
    },
  });
}

// Hook lấy chi tiết một account
export function useAccount(id: string) {
  return useQuery({
    queryKey: ACCOUNT_DETAIL_QUERY_KEY(id),
    queryFn: async (): Promise<AccountResponse | null> => {
      if (!id) return null;

      const tokenResponse = await getTokenResponse();
      if (!tokenResponse) return null;

      const response = await apiClient.get<never, ApiResponse<AccountResponse>>(
        `/identity-service/api/v1/accounts/${id}`
      );

      return response.data;
    },
    enabled: !!id,
  });
}

// Hook cập nhật account
export function useUpdateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<AccountResponse>;
    }): Promise<AccountResponse | null> => {
      try {
        const response = await apiClient.put<never, ApiResponse<AccountResponse>>(
          `/identity-service/api/v1/accounts/${id}`,
          data
        );
        toast.success("Cập nhật account thành công!");
        return response.data;
      } catch (error) {
        toast.error("Không thể cập nhật account.");
        throw error;
      }
    },
    onSuccess: (updatedAccount, { id }) => {
      if (updatedAccount) {
        // Update cache chi tiết
        queryClient.setQueryData(ACCOUNT_DETAIL_QUERY_KEY(id), updatedAccount);
        
        // Invalidate danh sách accounts
        queryClient.invalidateQueries({ queryKey: ACCOUNTS_QUERY_KEY });
      }
    },
  });
}

// Hook gán roles cho account
export function useAssignRolesToAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      roleNames,
    }: {
      id: string;
      roleNames: string[];
    }): Promise<AccountResponse | null> => {
      try {
        const response = await apiClient.post<never, ApiResponse<AccountResponse>>(
          `/identity-service/api/v1/accounts/${id}/assign-roles`,
          roleNames
        );
        toast.success(`Gán ${roleNames.length} role(s) thành công!`);
        return response.data;
      } catch (error) {
        toast.error("Không thể gán roles cho account.");
        throw error;
      }
    },
    onSuccess: (updatedAccount, { id }) => {
      queryClient.invalidateQueries({queryKey: ROLES_QUERY_KEY})

      if (updatedAccount) {
        // Update cache chi tiết
        queryClient.setQueryData(ACCOUNT_DETAIL_QUERY_KEY(id), updatedAccount);
        
        // Update trong danh sách accounts cache
        const cached = queryClient.getQueryData<AccountListResponse>(ACCOUNTS_QUERY_KEY);
        if (cached?.content) {
          const updatedContent = cached.content.map((account) =>
            account.id === id ? updatedAccount : account
          );
          queryClient.setQueryData(ACCOUNTS_QUERY_KEY, {
            ...cached,
            content: updatedContent,
          });
        } else {
          // Nếu không có cache thì invalidate
          queryClient.invalidateQueries({ queryKey: ACCOUNTS_QUERY_KEY });
        }
      }
    },
  });
}

// Hook thu hồi roles từ account
export function useRevokeRolesFromAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      roleNames,
    }: {
      id: string;
      roleNames: string[];
    }): Promise<AccountResponse | null> => {
      try {
        const response = await apiClient.post<never, ApiResponse<AccountResponse>>(
          `/identity-service/api/v1/accounts/${id}/revoke-roles`,
          roleNames
        );
        toast.success(`Thu hồi ${roleNames.length} role(s) thành công!`);
        return response.data;
      } catch (error) {
        toast.error("Không thể thu hồi roles từ account.");
        throw error;
      }
    },
    onSuccess: (updatedAccount, { id }) => {
      queryClient.invalidateQueries({queryKey: ROLES_QUERY_KEY})
      if (updatedAccount) {
        // Update cache chi tiết
        queryClient.setQueryData(ACCOUNT_DETAIL_QUERY_KEY(id), updatedAccount);
        
        // Update trong danh sách accounts cache
        const cached = queryClient.getQueryData<AccountListResponse>(ACCOUNTS_QUERY_KEY);
        if (cached?.content) {
          const updatedContent = cached.content.map((account) =>
            account.id === id ? updatedAccount : account
          );
          queryClient.setQueryData(ACCOUNTS_QUERY_KEY, {
            ...cached,
            content: updatedContent,
          });
        } else {
          // Nếu không có cache thì invalidate
          queryClient.invalidateQueries({ queryKey: ACCOUNTS_QUERY_KEY });
        }
      }
    },
  });
}

// Convenience hook để quản lý roles của account (gán và thu hồi)
export function useAccountRoles(accountId: string) {
  const assignRoles = useAssignRolesToAccount();
  const revokeRoles = useRevokeRolesFromAccount();

  return {
    assignRoles: (roleNames: string[]) => 
      assignRoles.mutateAsync({ id: accountId, roleNames }),
    revokeRoles: (roleNames: string[]) => 
      revokeRoles.mutateAsync({ id: accountId, roleNames }),
    isAssigning: assignRoles.isPending,
    isRevoking: revokeRoles.isPending,
    assignError: assignRoles.error,
    revokeError: revokeRoles.error,
  };
}