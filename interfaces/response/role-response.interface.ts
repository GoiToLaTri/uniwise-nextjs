import { PermissionResponse } from "@/hooks/use-permission";

export interface RoleResponse {
    id: number;
    displayName: string;
    name: string;
    description: string;
    isActive: boolean;
    userCount: number;
    permissions: PermissionResponse[]
}
  