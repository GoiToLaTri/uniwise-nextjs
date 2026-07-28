import axios from "axios";
import type {
  ApiErrorSource,
  AppApiError,
  EdgeErrorResponse,
  ServiceErrorResponse,
} from "../interfaces/response/api-error-response.interface";

const API_ERROR_SOURCES: ReadonlySet<ApiErrorSource> = new Set([
  "service",
  "edge",
  "network",
  "client",
  "unknown",
]);

const UNKNOWN_ERROR_MESSAGE = "Đã có lỗi không xác định xảy ra";

/**
 * Kiểm tra object thuần trước khi đọc field từ dữ liệu lỗi chưa biết.
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * Lấy `message` từ một object chưa xác định nếu có; nếu không dùng nội dung
 * dự phòng do caller cung cấp.
 */
function getFallbackMessage(value: unknown, fallback: string): string {
  if (isRecord(value) && typeof value.message === "string") {
    return value.message;
  }

  return fallback;
}

/**
 * Tạo một Error thật thay vì trả plain object để bảo toàn `name`, `message`,
 * stack trace và khả năng tương thích với error handler hiện có.
 */
function createAppApiError({
  message,
  source,
  httpStatus,
  code,
  path,
  errors = [],
}: {
  message: string;
  source: ApiErrorSource;
  httpStatus?: number;
  code?: string | number;
  path?: string;
  errors?: unknown[];
}): AppApiError {
  const error = new Error(message) as AppApiError;
  error.name = "AppApiError";
  error.source = source;
  error.errors = errors;

  if (httpStatus !== undefined) error.httpStatus = httpStatus;
  if (code !== undefined) error.code = code;
  if (path !== undefined) error.path = path;

  return error;
}

/**
 * Type guard cho lỗi chuẩn của service.
 *
 * Việc kiểm tra đủ các field đặc trưng giúp tránh nhầm response lạ thành lỗi service chỉ vì cùng có `code`.
 */
export function isServiceErrorResponse(
  value: unknown,
): value is ServiceErrorResponse {
  if (!isRecord(value)) return false;

  return (
    typeof value.timestamp === "string" &&
    typeof value.status === "number" &&
    typeof value.code === "string" &&
    typeof value.detail === "string" &&
    typeof value.path === "string" &&
    (value.errors === undefined || Array.isArray(value.errors))
  );
}

/**
 * Type guard cho lỗi do edge tạo.
 *
 * Edge error được nhận diện bởi `code` và `timestamp` dạng số cùng với
 * `message`; `source` không tồn tại trong response gốc.
 */
export function isEdgeErrorResponse(
  value: unknown,
): value is EdgeErrorResponse {
  if (!isRecord(value)) return false;

  return (
    typeof value.code === "number" &&
    typeof value.message === "string" &&
    typeof value.path === "string" &&
    typeof value.timestamp === "number"
  );
}

/**
 * Kiểm tra lỗi đã được chuẩn hóa để `normalizeApiError` có tính idempotent và không tạo Error mới khi interceptor xử lý lại cùng một lỗi.
 */
export function isAppApiError(value: unknown): value is AppApiError {
  if (!(value instanceof Error) || !isRecord(value)) return false;

  return (
    value.name === "AppApiError" &&
    typeof value.source === "string" &&
    API_ERROR_SOURCES.has(value.source as ApiErrorSource) &&
    Array.isArray(value.errors)
  );
}

/**
 * Chuẩn hóa mọi giá trị bị throw thành `AppApiError`.
 *
 * Thứ tự nhận diện:
 * 1. Giữ nguyên `AppApiError` đã chuẩn hóa.
 * 2. Nhận diện service error bằng contract có `status`, code chuỗi, `detail`.
 * 3. Nhận diện edge error bằng contract có code số và `message`.
 * 4. Axios error không có response được xem là lỗi mạng.
 * 5. HTTP response không khớp contract được đánh dấu `unknown`.
 * 6. Error cục bộ của frontend được đánh dấu `client`.
 *
 * Hàm chỉ chuẩn hóa dữ liệu kỹ thuật. Việc ánh xạ mã lỗi thành nội dung thân
 * thiện cho người dùng được thực hiện ở lớp `auth-error`.
 */
export function normalizeApiError(error: unknown): AppApiError {
  if (isAppApiError(error)) return error;

  if (axios.isAxiosError(error)) {
    const response = error.response;
    const responseData: unknown = response?.data;

    if (isServiceErrorResponse(responseData)) {
      return createAppApiError({
        message: responseData.detail,
        source: "service",
        httpStatus: response?.status ?? responseData.status,
        code: responseData.code,
        path: responseData.path,
        errors: responseData.errors ?? [],
      });
    }

    if (isEdgeErrorResponse(responseData)) {
      return createAppApiError({
        message: responseData.message,
        source: "edge",
        httpStatus: response?.status ?? responseData.code,
        code: responseData.code,
        path: responseData.path,
      });
    }

    if (!response) {
      return createAppApiError({
        message: error.message || "Không thể kết nối đến máy chủ",
        source: "network",
        code: error.code,
      });
    }

    return createAppApiError({
      message: getFallbackMessage(
        responseData,
        error.message || UNKNOWN_ERROR_MESSAGE,
      ),
      source: "unknown",
      httpStatus: response.status,
    });
  }

  if (error instanceof Error) {
    return createAppApiError({
      message: error.message || UNKNOWN_ERROR_MESSAGE,
      source: "client",
    });
  }

  return createAppApiError({
    message: getFallbackMessage(error, UNKNOWN_ERROR_MESSAGE),
    source: "unknown",
  });
}
