/**
 * Cấu trúc lỗi chuẩn do các service backend trả về.
 *
 * `code` là mã nghiệp vụ dạng chuỗi; nội dung phù hợp để hiển thị nằm trong
 * `detail`.
 */
export interface ServiceErrorResponse {
  timestamp: string;
  status: number;
  code: string;
  detail: string;
  path: string;
  errors?: unknown[];
}

/**
 * Cấu trúc lỗi được tạo trực tiếp tại Gateway/edge trước khi request tới
 * service.
 *
 * Khác với service error, `code` ở đây là mã HTTP dạng số và nội dung lỗi nằm
 * trong `message`.
 */
export interface EdgeErrorResponse {
  code: number;
  message: string;
  path: string;
  timestamp: number;
}

/**
 * Nguồn lỗi do frontend suy ra khi chuẩn hóa, không phải field backend trả về.
 *
 * `unknown` được dùng khi có lỗi nhưng dữ liệu không khớp chắc chắn với bất kỳ
 * contract nào đã biết.
 */
export type ApiErrorSource =
  | "service"
  | "edge"
  | "network"
  | "client"
  | "unknown";

/**
 * Error model duy nhất được truyền từ API client tới hook/component.
 *
 * Interface kế thừa `Error` để vẫn tương thích với các thư viện như React
 * Query, đồng thời giữ lại mã nghiệp vụ và HTTP status cho xử lý theo trường
 * hợp.
 */
export interface AppApiError extends Error {
  httpStatus?: number;
  code?: string | number;
  path?: string;
  errors: unknown[];
  source: ApiErrorSource;
}
