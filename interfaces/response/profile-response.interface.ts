/**
 * Hồ sơ đầy đủ chỉ dùng cho chính chủ và giao diện Admin.
 * Các API công khai phải dùng PublicProfileResponse.
 */
export interface ProfileResponse {
  id: string;
  accountId: string;
  email: string;
  name: string;
  avatarUrl: string;
  bio: string;
  publicId: string;
  profileType: string;
}
