import { getApiErrorMessage } from "@/lib/auth-error";
import { isAppApiError } from "@/lib/api-error";

const UPLOAD_ERROR_MESSAGES: Readonly<Record<string, string>> = {
  UPL_001: "Không nhận được tệp hoặc tệp đang trống. Vui lòng chọn lại tệp.",
  UPL_002: "Tệp vượt quá dung lượng cho phép. Vui lòng chọn tệp nhỏ hơn.",
  UPL_003: "Tên hoặc phần mở rộng tệp không hợp lệ. Vui lòng chọn lại tệp.",
  UPL_004: "Loại nội dung của tệp không được hỗ trợ. Vui lòng chọn lại tệp.",
  UPL_005:
    "Nội dung thực tế của tệp không đúng với định dạng đã khai báo. Vui lòng chọn lại tệp.",
  UPL_006: "Không thể đọc tệp đã chọn. Vui lòng chọn lại tệp.",
  UPL_007:
    "Không xác định được bài học cần tải video lên. Vui lòng tải lại trang.",
  UPL_008:
    "Bài học cần tải video lên không còn tồn tại. Dữ liệu khóa học đang được làm mới.",
  UPL_009:
    "Bài học này không còn là bài học video. Dữ liệu khóa học đang được làm mới.",
  UPL_010:
    "Tạm thời chưa thể xác minh quyền tải video. Vui lòng thử lại sau.",
  AUTH_006: "Bạn không có quyền tải tệp lên khóa học này.",
  SV_001: "Máy chủ không thể hoàn tất tải tệp. Vui lòng thử lại sau.",
};

/**
 * Chuyển mã lỗi upload của backend thành nội dung ngắn, có hướng xử lý.
 * Lỗi ngoài nhóm upload vẫn dùng cơ chế thông báo chung hiện có.
 */
export function getUploadErrorMessage(
  error: unknown,
  fallback = "Không thể tải tệp lên.",
): string {
  if (
    isAppApiError(error) &&
    typeof error.code === "string" &&
    UPLOAD_ERROR_MESSAGES[error.code]
  ) {
    return UPLOAD_ERROR_MESSAGES[error.code];
  }

  return getApiErrorMessage(error, fallback);
}

/**
 * Hai lỗi này cho biết lesson phía server đã thay đổi hoặc không còn tồn tại,
 * vì vậy giao diện cần lấy lại dữ liệu course thay vì tiếp tục dùng target cũ.
 */
export function shouldRefreshCourseAfterUploadError(error: unknown): boolean {
  return (
    isAppApiError(error) &&
    (error.code === "UPL_008" || error.code === "UPL_009")
  );
}

/**
 * Nhận diện request upload do người dùng hủy sau khi Axios error đã đi qua
 * interceptor và được chuẩn hóa thành `AppApiError`.
 */
export function isCanceledUploadError(error: unknown): boolean {
  return isAppApiError(error) && error.code === "ERR_CANCELED";
}
