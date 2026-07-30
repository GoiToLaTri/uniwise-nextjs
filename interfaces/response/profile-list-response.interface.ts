import { ListResponse } from "./list-response.interface";
import { ProfileResponse } from "./profile-response.interface";

/**
 * Danh sách profile đầy đủ từ endpoint chỉ dành cho Admin.
 * Chưa có type danh sách public vì backend chưa cung cấp endpoint tương ứng.
 */
export interface ProfileListResponse extends ListResponse {
  content: ProfileResponse[];
}
