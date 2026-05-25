import { ListResponse } from "./list-response.interface";
import { RoleResponse } from "./role-response.interface";

export interface RoleListResponse extends ListResponse {
    content: RoleResponse[];
}