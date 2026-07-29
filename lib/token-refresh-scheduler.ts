import { getApiErrorMessage } from "@/lib/auth-error";
import { readSessionSnapshot } from "@/lib/session-repository";
import {
  retainSessionEventBridge,
  SESSION_CLEARED_EVENT,
  SESSION_UPDATED_EVENT,
  type SessionClearedEventDetail,
} from "@/lib/session-events";
import { refreshSession } from "@/lib/token-refresh-coordinator";

const CHECK_INTERVAL_MS = 60 * 1000;
const REFRESH_THRESHOLD_MS = 3 * 60 * 1000;

let subscriberCount = 0;
let timer: ReturnType<typeof setInterval> | null = null;
let activeCheckPromise: Promise<void> | null = null;
let listenersAttached = false;
let releaseSessionEventBridge: (() => void) | null = null;

/**
 * Dừng đồng hồ kiểm tra token nhưng vẫn giữ các listener của trình duyệt.
 */
function stopTimer(): void {
  if (!timer) return;

  globalThis.clearInterval(timer);
  timer = null;
}

/**
 * Nếu access token còn tối đa ba phút thì yêu cầu coordinator refresh.
 * Scheduler chỉ yêu cầu refresh, không tự gọi API hoặc xóa session.
 */
async function performScheduledCheck(): Promise<void> {
  const snapshot = await readSessionSnapshot();

  if (!snapshot) {
    stopTimer();
    return;
  }

  const expiresAt = new Date(snapshot.tokenResponse.expiresAt).getTime();
  const timeLeft = expiresAt - Date.now();

  if (timeLeft > REFRESH_THRESHOLD_MS) return;

  try {
    await refreshSession();
  } catch (error) {
    console.error(
      "[token-refresh-scheduler] Không thể làm mới phiên:",
      getApiErrorMessage(error),
    );
  }
}

/**
 * Nếu một lượt kiểm tra đang chạy thì dùng lại promise đó.
 * Nhờ vậy timer, focus và visibility không kiểm tra trùng nhau.
 */
function checkSession(): Promise<void> {
  if (activeCheckPromise) return activeCheckPromise;

  activeCheckPromise = performScheduledCheck()
    .catch((error: unknown) => {
      console.error(
        "[token-refresh-scheduler] Không thể kiểm tra session:",
        error,
      );
    })
    .finally(() => {
      activeCheckPromise = null;
    });

  return activeCheckPromise;
}

/**
 * Bật một đồng hồ kiểm tra token duy nhất trong tab.
 */
function ensureTimer(): void {
  if (timer || subscriberCount === 0) return;

  timer = globalThis.setInterval(() => {
    void checkSession();
  }, CHECK_INTERVAL_MS);
}

/**
 * Kiểm tra token ngay khi người dùng quay lại cửa sổ.
 */
function handleWindowFocus(): void {
  ensureTimer();
  void checkSession();
}

/**
 * Khi tab hiện trở lại, kiểm tra token ngay.
 */
function handleVisibilityChange(): void {
  if (document.visibilityState !== "visible") return;

  ensureTimer();
  void checkSession();
}

/**
 * Khi session thay đổi, bảo đảm đồng hồ kiểm tra vẫn đang chạy.
 */
function handleSessionUpdated(): void {
  ensureTimer();
}

/**
 * Khi session bị xóa, dừng đồng hồ.
 * Nếu tab khác vừa logout, chuyển tab hiện tại về trang đăng nhập.
 */
function handleSessionCleared(event: Event): void {
  stopTimer();

  if (
    event instanceof CustomEvent &&
    (event.detail as SessionClearedEventDetail | undefined)?.origin ===
      "broadcast"
  ) {
    window.location.replace("/signin");
  }
}

/**
 * Đăng ký các listener focus, visibility và session cho tab.
 */
function attachBrowserListeners(): void {
  if (listenersAttached || typeof window === "undefined") return;

  window.addEventListener("focus", handleWindowFocus);
  window.addEventListener(SESSION_UPDATED_EVENT, handleSessionUpdated);
  window.addEventListener(SESSION_CLEARED_EVENT, handleSessionCleared);
  document.addEventListener("visibilitychange", handleVisibilityChange);
  releaseSessionEventBridge = retainSessionEventBridge();
  listenersAttached = true;
}

/**
 * Gỡ listener khi không còn layout nào cần scheduler.
 */
function detachBrowserListeners(): void {
  if (!listenersAttached || typeof window === "undefined") return;

  window.removeEventListener("focus", handleWindowFocus);
  window.removeEventListener(SESSION_UPDATED_EVENT, handleSessionUpdated);
  window.removeEventListener(SESSION_CLEARED_EVENT, handleSessionCleared);
  document.removeEventListener("visibilitychange", handleVisibilityChange);
  releaseSessionEventBridge?.();
  releaseSessionEventBridge = null;
  listenersAttached = false;
}

/**
 * Cho một layout sử dụng scheduler và trả về hàm cleanup.
 * Layout đầu tiên sẽ bật scheduler; layout cuối cùng rời đi sẽ tắt scheduler.
 */
export function retainTokenRefreshScheduler(): () => void {
  subscriberCount += 1;

  if (subscriberCount === 1) {
    attachBrowserListeners();
    ensureTimer();
    void checkSession();
  }

  let released = false;

  return () => {
    if (released) return;
    released = true;
    subscriberCount = Math.max(0, subscriberCount - 1);

    if (subscriberCount === 0) {
      stopTimer();
      detachBrowserListeners();
    }
  };
}
