import type { TokenResponse } from "@/interfaces/response";
import { getDB, STORE } from "@/lib/db";
import {
  clearAccessTokenCookie,
  syncAccessTokenCookie,
} from "@/lib/token";
import {
  emitSessionCleared,
  type SessionClearReason,
} from "@/lib/session-events";

// TODO: nghiên cứu thêm

const SESSION_KEY = "session";

interface StoredSessionRecord {
  tokenResponse: TokenResponse;
  revision: number;
  updatedAt: number;
  cookieSyncPending: boolean;
}

export interface SessionSnapshot {
  tokenResponse: TokenResponse;
  revision: number;
  updatedAt: number;
  cookieSyncPending: boolean;
}

export type SessionOperationResult =
  | { ok: true }
  | { ok: false; error: unknown };

export interface CommitSessionResult {
  snapshot: SessionSnapshot;
  cookie: SessionOperationResult;
}

export interface ClearSessionResult {
  cleared: boolean;
  storage: SessionOperationResult;
  cookie: SessionOperationResult;
}

/**
 * Kiểm tra giá trị có phải object hay không.
 * Cần kiểm tra riêng `null` vì JavaScript cũng xem `null` là object.
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * Kiểm tra dữ liệu đọc từ IndexedDB có đủ các field của TokenResponse không.
 * Việc này tránh dùng nhầm dữ liệu cũ hoặc bị hỏng làm token hợp lệ.
 */
function isTokenResponse(value: unknown): value is TokenResponse {
  if (!isRecord(value)) return false;

  return (
    typeof value.accessToken === "string" &&
    typeof value.refreshToken === "string" &&
    typeof value.sessionId === "string" &&
    typeof value.scope === "string" &&
    typeof value.tokenType === "string" &&
    typeof value.expiresAt === "string"
  );
}

/**
 * Chuẩn hóa dữ liệu trong IndexedDB thành SessionSnapshot.
 * Vẫn đọc được TokenResponse của phiên bản cũ để người dùng không bị logout.
 * Dữ liệu không hợp lệ được xem như không có session.
 */
function toSessionSnapshot(value: unknown): SessionSnapshot | null {
  if (isTokenResponse(value)) {
    return {
      tokenResponse: value,
      revision: 0,
      updatedAt: 0,
      cookieSyncPending: false,
    };
  }

  if (
    !isRecord(value) ||
    !isTokenResponse(value.tokenResponse) ||
    typeof value.revision !== "number" ||
    typeof value.updatedAt !== "number" ||
    typeof value.cookieSyncPending !== "boolean"
  ) {
    return null;
  }

  return {
    tokenResponse: value.tokenResponse,
    revision: value.revision,
    updatedAt: value.updatedAt,
    cookieSyncPending: value.cookieSyncPending,
  };
}

/**
 * Tạo đúng cấu trúc record cần lưu vào IndexedDB.
 * Chỉ các field được liệt kê ở đây mới được lưu.
 */
function toStoredSessionRecord(
  snapshot: SessionSnapshot,
): StoredSessionRecord {
  return {
    tokenResponse: snapshot.tokenResponse,
    revision: snapshot.revision,
    updatedAt: snapshot.updatedAt,
    cookieSyncPending: snapshot.cookieSyncPending,
  };
}

/**
 * Đánh dấu cookie đã hoặc chưa đồng bộ cho đúng phiên bản session.
 * Nếu session đã có revision mới hơn, bỏ qua để không sửa nhầm session mới.
 */
async function updateCookieSyncState(
  snapshot: SessionSnapshot,
  cookieSyncPending: boolean,
): Promise<SessionSnapshot> {
  const db = await getDB();
  const transaction = db.transaction(STORE.AUTH, "readwrite");
  const current = toSessionSnapshot(
    await transaction.objectStore(STORE.AUTH).get(SESSION_KEY),
  );

  if (!current || current.revision !== snapshot.revision) {
    await transaction.done;
    return snapshot;
  }

  const updatedSnapshot = {
    ...current,
    cookieSyncPending,
  };

  await transaction
    .objectStore(STORE.AUTH)
    .put(toStoredSessionRecord(updatedSnapshot), SESSION_KEY);
  await transaction.done;

  return updatedSnapshot;
}

/**
 * Đọc session hiện tại từ IndexedDB.
 * Trả về `null` nếu chưa đăng nhập hoặc dữ liệu lưu không hợp lệ.
 */
export async function readSessionSnapshot(): Promise<SessionSnapshot | null> {
  const db = await getDB();
  return toSessionSnapshot(await db.get(STORE.AUTH, SESSION_KEY));
}

/**
 * Gửi access token sang cookie để middleware/proxy có thể đọc.
 * Nếu đồng bộ thất bại, trả lỗi về caller nhưng vẫn giữ token trong IndexedDB.
 */
export async function syncSessionCookie(
  snapshot: SessionSnapshot,
): Promise<SessionOperationResult> {
  try {
    await syncAccessTokenCookie(snapshot.tokenResponse);
    await updateCookieSyncState(snapshot, false);
    return { ok: true };
  } catch (error) {
    return { ok: false, error };
  }
}

/**
 * Lưu nguyên cặp access/refresh token vào IndexedDB rồi đồng bộ access token
 * sang cookie.
 *
 * Mỗi lần lưu sẽ tăng `revision`. Nếu cookie lỗi, token mới vẫn được giữ và
 * `cookieSyncPending` vẫn là `true` để biết cookie chưa đồng bộ xong.
 */
export async function commitSession(
  tokenResponse: TokenResponse,
): Promise<CommitSessionResult> {
  const db = await getDB();
  const transaction = db.transaction(STORE.AUTH, "readwrite");
  const current = toSessionSnapshot(
    await transaction.objectStore(STORE.AUTH).get(SESSION_KEY),
  );
  const snapshot: SessionSnapshot = {
    tokenResponse,
    revision: (current?.revision ?? 0) + 1,
    updatedAt: Date.now(),
    cookieSyncPending: true,
  };

  await transaction
    .objectStore(STORE.AUTH)
    .put(toStoredSessionRecord(snapshot), SESSION_KEY);
  await transaction.done;

  const cookie = await syncSessionCookie(snapshot);

  return {
    snapshot: cookie.ok
      ? { ...snapshot, cookieSyncPending: false }
      : snapshot,
    cookie,
  };
}

/**
 * Xóa toàn bộ dữ liệu đăng nhập: token, profile cache và access-token cookie.
 * Luôn thử xóa cookie kể cả khi thao tác với IndexedDB bị lỗi.
 */
export async function clearLocalSession(
  reason: SessionClearReason = "unknown",
): Promise<ClearSessionResult> {
  let storage: SessionOperationResult;
  let cookie: SessionOperationResult;

  try {
    const db = await getDB();
    const transaction = db.transaction(
      [STORE.AUTH, STORE.PROFILE],
      "readwrite",
    );

    await Promise.all([
      transaction.objectStore(STORE.AUTH).delete(SESSION_KEY),
      transaction.objectStore(STORE.PROFILE).clear(),
    ]);
    await transaction.done;
    storage = { ok: true };
    emitSessionCleared(reason);
  } catch (error) {
    storage = { ok: false, error };
  }

  try {
    await clearAccessTokenCookie();
    cookie = { ok: true };
  } catch (error) {
    cookie = { ok: false, error };
  }

  return {
    cleared: storage.ok && cookie.ok,
    storage,
    cookie,
  };
}
