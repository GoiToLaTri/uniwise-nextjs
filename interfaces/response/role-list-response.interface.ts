import { ListResponse } from "./list-response.interface";
import { RoleAdminResponse } from "./role-response.interface";

export interface RoleListResponse extends ListResponse {
  content: RoleAdminResponse[];
}
