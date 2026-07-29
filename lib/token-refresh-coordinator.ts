import type {
  ApiResponse,
  AppApiError,
  TokenResponse,
} from "@/interfaces/response";
import { normalizeApiError } from "@/lib/api-error";
import {
  isAuthenticationServiceUnavailable,
  rememberPendingAuthError,
} from "@/lib/auth-error";
import publicApiClient from "@/lib/public-api-client";
import { isTokenResponseExpired } from "@/stores/token-store";
import { withCrossTabRefreshLock } from "@/lib/cross-tab-refresh-lock";
import {
  clearRefreshCooldown,
  getActiveRefreshCooldown,
  startServiceUnavailableCooldown,
} from "@/lib/refresh-cooldown";
import { emitSessionUpdated } from "@/lib/session-events";
import {
  clearLocalSession,
  commitSession,
  readSessionSnapshot,
  type SessionSnapshot,
} from "@/lib/session-repository";

let activeRefreshPromise: Promise<SessionSnapshot | null> | null = null;
let preflightCooldownUntil = 0;
let lastPreflightError: AppApiError | null = null;

const UNRECOVERABLE_REFRESH_CODES: ReadonlySet<string> = new Set([
  "AUTH_002",
  "AUTH_003",
  "AUTH_004",
  "AUTH_005",
]);

interface RefreshAttemptState {
  requestInvoked: boolean;
}

/**
 * Kiểm tra session có bị tab/request khác thay đổi trong lúc chờ khóa không.
 */
function isSameSession(
  observed: SessionSnapshot,
  current: SessionSnapshot,
): boolean {
  return (
    observed.revision === current.revision &&
    observed.tokenResponse.accessToken === current.tokenResponse.accessToken &&
    observed.tokenResponse.refreshToken === current.tokenResponse.refreshToken
  );
}

/**
 * Tạo lỗi 503 phía frontend khi đang trong thời gian chờ sau một lỗi 503 trước
 * đó. Lúc này không gửi thêm request refresh.
 */
function createRefreshCooldownError(
  cooldownExpiresAt: number,
): AppApiError {
  const error = new Error(
    "Dịch vụ xác thực tạm thời không khả dụng. Vui lòng thử lại sau.",
  ) as AppApiError;
  error.name = "AppApiError";
  error.source = "client";
  error.httpStatus = 503;
  error.code = 503;
  error.errors = [];
  error.cause = { cooldownExpiresAt };
  return error;
}

/**
 * Tạm dừng refresh 3 giây nếu lỗi xảy ra trước khi request được gửi.
 * Mục đích là tránh frontend thử lại liên tục khi IndexedDB hoặc lock đang lỗi.
 */
function rememberPreflightCooldown(
  error: AppApiError,
): void {
  preflightCooldownUntil = Date.now() + 3 * 1000;
  lastPreflightError = error;
}

/**
 * Xóa session và chuyển về trang đăng nhập khi refresh không thể phục hồi.
 */
async function invalidateSessionAfterRefreshFailure(
  error: AppApiError,
): Promise<void> {
  rememberPendingAuthError(error);
  const clearResult = await clearLocalSession("refresh-failure");
  if (!clearResult.cleared) {
    console.error(
      "[token-refresh] Không thể xóa toàn bộ session cục bộ:",
      clearResult,
    );
  }

  if (typeof window !== "undefined") {
    window.location.replace("/signin");
  }
}

/**
 * Kiểm tra lỗi backend có bắt buộc người dùng đăng nhập lại không.
 */
function isUnrecoverableRefreshError(error: AppApiError): boolean {
  return (
    typeof error.code === "string" &&
    UNRECOVERABLE_REFRESH_CODES.has(error.code)
  );
}

/**
 * Refresh token sau khi tab đã lấy được khóa.
 *
 * Hàm đọc lại session trước khi gọi API. Nếu tab khác đã refresh xong thì dùng
 * session mới đó, không gửi lại refresh token cũ.
 */
async function refreshInsideCrossTabLock(
  observed: SessionSnapshot,
  attemptState: RefreshAttemptState,
): Promise<SessionSnapshot | null> {
  const current = await readSessionSnapshot();

  if (!current) return null;

  if (!isSameSession(observed, current)) {
    if (!isTokenResponseExpired(current.tokenResponse)) {
      return current;
    }

    // Session đã đổi nên trả session mới về, tuyệt đối không dùng token cũ.
    return current;
  }

  const cooldownExpiresAt = await getActiveRefreshCooldown(current);
  if (cooldownExpiresAt) {
    throw createRefreshCooldownError(cooldownExpiresAt);
  }

  let response: ApiResponse<TokenResponse>;
  attemptState.requestInvoked = true;

  try {
    response = await publicApiClient.post<
      ApiResponse<TokenResponse>,
      ApiResponse<TokenResponse>,
      { refreshToken: string }
    >(
      "/identity-service/api/v1/authentication/refresh",
      { refreshToken: current.tokenResponse.refreshToken },
    );
  } catch (error) {
    const apiError = normalizeApiError(error);

    if (isAuthenticationServiceUnavailable(apiError)) {
      try {
        await startServiceUnavailableCooldown(current);
      } catch (cooldownError) {
        // Vẫn giữ lỗi 503 gốc nếu việc lưu cooldown bị lỗi.
        console.error(
          "[token-refresh] Không thể ghi cooldown 503:",
          cooldownError,
        );
      }
    }

    throw apiError;
  }

  const commitResult = await commitSession(response.data);
  if (!commitResult.cookie.ok) {
    console.error(
      "[token-refresh] Token mới đã lưu nhưng chưa đồng bộ được cookie:",
      commitResult.cookie.error,
    );
  }

  try {
    await clearRefreshCooldown(commitResult.snapshot);
  } catch (error) {
    // Token mới đã lưu thành công nên không xóa lại chỉ vì dọn cooldown lỗi.
    console.error("[token-refresh] Không thể xóa cooldown cũ:", error);
  }

  emitSessionUpdated(commitResult.snapshot.revision, "refresh");
  return commitResult.snapshot;
}

/**
 * Điều khiển toàn bộ một lượt refresh và quyết định cách xử lý lỗi:
 * - 503: giữ session và chờ trước khi thử lại.
 * - Lỗi trước khi gửi request: giữ session và tạm dừng ngắn.
 * - Lỗi xác thực hoặc kết quả không chắc chắn: xóa session, yêu cầu login lại.
 */
async function performTokenRefresh(): Promise<SessionSnapshot | null> {
  const attemptState: RefreshAttemptState = { requestInvoked: false };

  try {
    const observed = await readSessionSnapshot();

    if (!observed?.tokenResponse.refreshToken) {
      console.warn("[token-refresh] Không tìm thấy refresh token.");
      return null;
    }

    return await withCrossTabRefreshLock(observed.revision, () =>
      refreshInsideCrossTabLock(observed, attemptState),
    );
  } catch (error) {
    const apiError = normalizeApiError(error);
    console.error("[token-refresh] Refresh token thất bại:", apiError);

    // 503 là lỗi dịch vụ tạm thời nên vẫn giữ session.
    if (isAuthenticationServiceUnavailable(apiError)) {
      throw apiError;
    }

    if (!attemptState.requestInvoked) {
      rememberPreflightCooldown(apiError);
      throw apiError;
    }

    if (isUnrecoverableRefreshError(apiError)) {
      await invalidateSessionAfterRefreshFailure(apiError);
      throw apiError;
    }

    // Request có thể đã làm backend đổi token. Không thử lại token cũ vì có thể
    // làm session bị thu hồi; yêu cầu người dùng đăng nhập lại cho an toàn.
    await invalidateSessionAfterRefreshFailure(apiError);
    throw apiError;
  }
}

export function refreshSession(): Promise<SessionSnapshot | null> {
  // Nếu đã có refresh đang chạy, mọi caller cùng chờ kết quả đó.
  if (activeRefreshPromise) return activeRefreshPromise;

  // Nếu đang tạm dừng do lỗi trước đó, không gửi thêm request.
  if (lastPreflightError && preflightCooldownUntil > Date.now()) {
    return Promise.reject(lastPreflightError);
  }

  // Hết thời gian chờ: xóa lỗi cũ để bắt đầu lượt refresh mới.
  lastPreflightError = null;
  preflightCooldownUntil = 0;

  // Giữ promise này để các caller trong cùng tab không tạo nhiều request.
  activeRefreshPromise = performTokenRefresh().finally(() => {
    activeRefreshPromise = null;
  });

  return activeRefreshPromise;
}
