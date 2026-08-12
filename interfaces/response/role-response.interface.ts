import { PermissionResponse } from "@/hooks/use-permission";

export interface RoleResponse {
  id: number;
  displayName: string;
  name: string;
  description: string;
  isActive: boolean;
  permissions: PermissionResponse[];
}

/**
 * Dữ liệu rút gọn backend trả trong danh sách quản trị role.
 * Danh sách có `userCount` nhưng không mang toàn bộ `permissions`.
 */
export interface RoleAdminResponse {
  id: number;
  displayName: string;
  name: string;
  description: string;
  isActive: boolean;
  userCount: number;
}
