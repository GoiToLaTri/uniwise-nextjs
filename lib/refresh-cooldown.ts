import { getDB, STORE } from "@/lib/db";
import type { SessionSnapshot } from "@/lib/session-repository";

const REFRESH_COOLDOWN_KEY = "refresh-cooldown";
const SERVICE_UNAVAILABLE_COOLDOWN_MS = 10 * 1000;

interface RefreshCooldownRecord {
  sessionId: string;
  sessionRevision: number;
  expiresAt: number;
}

/**
 * Kiểm tra dữ liệu thời gian chờ trong IndexedDB có đúng cấu trúc không.
 */
function isRefreshCooldownRecord(
  value: unknown,
): value is RefreshCooldownRecord {
  if (typeof value !== "object" || value === null) return false;

  const record = value as Record<string, unknown>;
  return (
    typeof record.sessionId === "string" &&
    typeof record.sessionRevision === "number" &&
    typeof record.expiresAt === "number"
  );
}

/**
 * Đọc thời điểm được phép refresh lại sau lỗi 503.
 * Bỏ qua dữ liệu đã hết hạn hoặc thuộc session khác.
 */
export async function getActiveRefreshCooldown(
  snapshot: SessionSnapshot,
): Promise<number | null> {
  const db = await getDB();
  const value: unknown = await db.get(STORE.AUTH, REFRESH_COOLDOWN_KEY);

  if (
    !isRefreshCooldownRecord(value) ||
    value.sessionId !== snapshot.tokenResponse.sessionId ||
    value.sessionRevision !== snapshot.revision ||
    value.expiresAt <= Date.now()
  ) {
    return null;
  }

  return value.expiresAt;
}

/**
 * Sau lỗi 503, yêu cầu các tab chờ một khoảng ngắn trước khi refresh lại.
 */
export async function startServiceUnavailableCooldown(
  snapshot: SessionSnapshot,
): Promise<void> {
  const db = await getDB();
  const cooldown: RefreshCooldownRecord = {
    sessionId: snapshot.tokenResponse.sessionId,
    sessionRevision: snapshot.revision,
    expiresAt: Date.now() + SERVICE_UNAVAILABLE_COOLDOWN_MS,
  };

  await db.put(STORE.AUTH, cooldown, REFRESH_COOLDOWN_KEY);
}

/**
 * Xóa thời gian chờ sau khi refresh thành công.
 * Chỉ xóa dữ liệu thuộc đúng session hiện tại.
 */
export async function clearRefreshCooldown(
  snapshot: SessionSnapshot,
): Promise<void> {
  const db = await getDB();
  const transaction = db.transaction(STORE.AUTH, "readwrite");
  const store = transaction.objectStore(STORE.AUTH);
  const value: unknown = await store.get(REFRESH_COOLDOWN_KEY);

  if (
    isRefreshCooldownRecord(value) &&
    value.sessionId === snapshot.tokenResponse.sessionId
  ) {
    await store.delete(REFRESH_COOLDOWN_KEY);
  }

  await transaction.done;
}
