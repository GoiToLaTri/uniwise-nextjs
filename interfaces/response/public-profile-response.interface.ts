/**
 * Dữ liệu profile được phép hiển thị công khai.
 * Type này cố ý không chứa internal ID, accountId hoặc email.
 */
export interface PublicProfileResponse {
  publicId: string;
  name: string;
  avatarUrl: string | null;
  bio: string | null;
  profileType: "USER" | "INSTRUCTOR" | "ADMIN";
}
