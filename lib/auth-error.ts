import type { AppApiError } from "@/interfaces/response";
import { isAppApiError } from "./api-error";

const PENDING_AUTH_ERROR_KEY = "uniwise_pending_auth_error";

const AUTH_ERROR_MESSAGES: Readonly<Record<string, string>> = {
  AUTH_001: "Email hoặc mật khẩu không chính xác.",
  AUTH_002: "Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.",
  AUTH_003: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
  AUTH_004:
    "Phát hiện dấu hiệu phiên đăng nhập không an toàn. Tất cả phiên đã bị thu hồi, vui lòng đăng nhập lại.",
  AUTH_005: "Phiên đăng nhập đã kết thúc hoặc bị thu hồi. Vui lòng đăng nhập lại.",
  AUTH_006: "Bạn không có quyền thực hiện thao tác này.",
  AUTH_007:
    "Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.",
};

const EDGE_AUTH_ERROR_MESSAGES: Readonly<Record<number, string>> = {
  401: "Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.",
  503: "Dịch vụ xác thực tạm thời không khả dụng. Vui lòng thử lại sau.",
};

/**
 * Chuyển một lỗi chưa xác định thành thông báo có thể hiển thị cho người dùng.
 *
 * Thứ tự ưu tiên:
 * 1. Nếu chưa phải `AppApiError`, dùng message của Error thông thường.
 * 2. Với mã `AUTH_001`–`AUTH_007`, dùng nội dung tiếng Việt đã ánh xạ.
 * 3. Với lỗi edge 401/503, dùng nội dung dành riêng cho Gateway.
 * 4. Các lỗi còn lại giữ nguyên `message`/`detail` đã được api-error chuẩn hóa.
 * 5. Chỉ dùng `fallback` khi không lấy được nội dung nào từ lỗi.
 */
export function getApiErrorMessage(
  error: unknown,
  fallback = "Đã có lỗi xác thực xảy ra.",
): string {
  if (!isAppApiError(error)) {
    return error instanceof Error && error.message ? error.message : fallback;
  }

  if (typeof error.code === "string" && AUTH_ERROR_MESSAGES[error.code]) {
    return AUTH_ERROR_MESSAGES[error.code];
  }

  if (
    error.source === "edge" &&
    typeof error.code === "number" &&
    EDGE_AUTH_ERROR_MESSAGES[error.code]
  ) {
    return EDGE_AUTH_ERROR_MESSAGES[error.code];
  }

  return error.message || fallback;
}

/**
 * Xác định lỗi refresh có phải do dịch vụ xác thực tạm thời không khả dụng hay không.
 *
 * Kiểm tra cả HTTP status và code trong body vì edge error dùng code số. Khi
 * hàm trả về `true`, caller không nên xóa credential hoặc coi phiên đăng nhập
 * là không hợp lệ.
 */
export function isAuthenticationServiceUnavailable(
  error: AppApiError,
): boolean {
  return error.httpStatus === 503 || error.code === 503;
}

/**
 * Lưu thông báo lỗi xác thực trước khi thực hiện hard navigation về `/signin`.
 *
 * `sessionStorage` giữ dữ liệu trong đúng tab hiện tại và tồn tại qua lần điều hướng kế tiếp. Lỗi storage được bỏ qua để không ngăn quá trình đăng xuất hoặc điều hướng đăng nhập.
 */
export function rememberPendingAuthError(error: unknown): void {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.setItem(
      PENDING_AUTH_ERROR_KEY,
      getApiErrorMessage(error),
    );
  } catch {
    // Storage có thể bị chặn; điều hướng đăng nhập vẫn phải tiếp tục.
  }
}

/**
 * Đọc và xóa ngay thông báo xác thực đã lưu.
 *
 * Cơ chế consume-once giúp form đăng nhập chỉ hiển thị toast một lần sau khi bị chuyển hướng vì refresh token thất bại. Hàm trả `null` khi chạy phía
 * server, không có thông báo hoặc trình duyệt chặn storage.
 */
export function consumePendingAuthError(): string | null {
  if (typeof window === "undefined") return null;

  try {
    const message = window.sessionStorage.getItem(PENDING_AUTH_ERROR_KEY);
    window.sessionStorage.removeItem(PENDING_AUTH_ERROR_KEY);
    return message;
  } catch {
    return null;
  }
}
