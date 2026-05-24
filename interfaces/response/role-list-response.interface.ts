import { RoleResponse } from "./role-response.interface";

export interface RoleListResponse {
    content: RoleResponse[];
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
}