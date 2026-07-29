import { getDB, STORE } from "@/lib/db";

const REFRESH_LOCK_NAME = "uniwise:auth:refresh";
const REFRESH_LEASE_KEY = "refresh-lease";
const LEASE_TTL_MS = 60 * 1000;
const LEASE_RENEW_INTERVAL_MS = 15 * 1000;
const LEASE_RETRY_MIN_MS = 100;
const LEASE_RETRY_JITTER_MS = 150;

// TODO: nghiên cứu thêm về Web Locks API: https://web.dev/web-locks/

interface RefreshLeaseRecord {
  ownerId: string;
  expiresAt: number;
  sessionRevision: number;
}

let tabOwnerId: string | null = null;

/**
 * Tạo ID để biết tab nào đang giữ khóa dự phòng.
 * ID này không phải token và không được gửi lên backend.
 */
function getTabOwnerId(): string {
  if (tabOwnerId) return tabOwnerId;

  tabOwnerId =
    globalThis.crypto?.randomUUID?.() ??
    `tab-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return tabOwnerId;
}

/**
 * Kiểm tra dữ liệu khóa đọc từ IndexedDB có đúng cấu trúc không.
 */
function isRefreshLeaseRecord(value: unknown): value is RefreshLeaseRecord {
  if (typeof value !== "object" || value === null) return false;

  const record = value as Record<string, unknown>;
  return (
    typeof record.ownerId === "string" &&
    typeof record.expiresAt === "number" &&
    typeof record.sessionRevision === "number"
  );
}

/**
 * Chờ một khoảng ngắn, có thêm thời gian ngẫu nhiên, rồi thử lấy khóa lại.
 * Điều này giúp nhiều tab không cùng thử lại đúng một thời điểm.
 */
function waitBeforeLeaseRetry(): Promise<void> {
  const delay =
    LEASE_RETRY_MIN_MS + Math.random() * LEASE_RETRY_JITTER_MS;

  return new Promise((resolve) => {
    globalThis.setTimeout(resolve, delay);
  });
}

/**
 * Thử lấy khóa dự phòng trong IndexedDB.
 * Transaction ghi bảo đảm tại một thời điểm chỉ một tab lấy khóa thành công.
 */
async function tryAcquireRefreshLease(
  ownerId: string,
  sessionRevision: number,
): Promise<boolean> {
  const db = await getDB();
  const transaction = db.transaction(STORE.AUTH, "readwrite");
  const store = transaction.objectStore(STORE.AUTH);
  const currentValue: unknown = await store.get(REFRESH_LEASE_KEY);
  const currentLease = isRefreshLeaseRecord(currentValue)
    ? currentValue
    : null;
  const now = Date.now();

  if (
    currentLease &&
    currentLease.ownerId !== ownerId &&
    currentLease.expiresAt > now
  ) {
    await transaction.done;
    return false;
  }

  const lease: RefreshLeaseRecord = {
    ownerId,
    expiresAt: now + LEASE_TTL_MS,
    sessionRevision,
  };

  await store.put(lease, REFRESH_LEASE_KEY);
  await transaction.done;
  return true;
}

/**
 * Gia hạn khóa khi tab vẫn đang refresh.
 * Chỉ tab đang sở hữu khóa mới được phép gia hạn.
 */
async function renewRefreshLease(ownerId: string): Promise<void> {
  const db = await getDB();
  const transaction = db.transaction(STORE.AUTH, "readwrite");
  const store = transaction.objectStore(STORE.AUTH);
  const currentValue: unknown = await store.get(REFRESH_LEASE_KEY);

  if (
    isRefreshLeaseRecord(currentValue) &&
    currentValue.ownerId === ownerId
  ) {
    await store.put(
      {
        ...currentValue,
        expiresAt: Date.now() + LEASE_TTL_MS,
      } satisfies RefreshLeaseRecord,
      REFRESH_LEASE_KEY,
    );
  }

  await transaction.done;
}

/**
 * Trả khóa nếu khóa vẫn thuộc tab hiện tại.
 * Việc kiểm tra owner tránh xóa nhầm khóa mà tab khác đang giữ.
 */
async function releaseRefreshLease(ownerId: string): Promise<void> {
  const db = await getDB();
  const transaction = db.transaction(STORE.AUTH, "readwrite");
  const store = transaction.objectStore(STORE.AUTH);
  const currentValue: unknown = await store.get(REFRESH_LEASE_KEY);

  if (
    isRefreshLeaseRecord(currentValue) &&
    currentValue.ownerId === ownerId
  ) {
    await store.delete(REFRESH_LEASE_KEY);
  }

  await transaction.done;
}

/**
 * Chạy refresh bằng khóa IndexedDB khi trình duyệt không có Web Locks.
 * Khóa có hạn dùng để tab khác tiếp tục nếu tab đang giữ khóa bị đóng.
 */
async function runWithIndexedDbLease<T>(
  sessionRevision: number,
  task: () => Promise<T>,
): Promise<T> {
  const ownerId = getTabOwnerId();

  while (!(await tryAcquireRefreshLease(ownerId, sessionRevision))) {
    await waitBeforeLeaseRetry();
  }

  const renewalTimer = globalThis.setInterval(() => {
    void renewRefreshLease(ownerId).catch((error: unknown) => {
      console.error("[token-refresh-lock] Không thể gia hạn lease:", error);
    });
  }, LEASE_RENEW_INTERVAL_MS);

  try {
    return await task();
  } finally {
    globalThis.clearInterval(renewalTimer);

    try {
      await releaseRefreshLease(ownerId);
    } catch (error) {
      // Nếu trả khóa lỗi, khóa vẫn tự hết hạn nên không bị kẹt vĩnh viễn.
      console.error("[token-refresh-lock] Không thể giải phóng lease:", error);
    }
  }
}

/**
 * Bảo đảm chỉ một tab được chạy refresh tại một thời điểm.
 * Ưu tiên Web Locks; nếu không hỗ trợ thì dùng khóa IndexedDB dự phòng.
 * Token không được truyền qua cơ chế khóa này.
 */
export function withCrossTabRefreshLock<T>(
  sessionRevision: number,
  task: () => Promise<T>,
): Promise<T> {
  if (typeof navigator !== "undefined" && navigator.locks) {
    return navigator.locks
      .request<Promise<T>>(
        REFRESH_LOCK_NAME,
        { mode: "exclusive" },
        task,
      )
      .then((result) => result);
  }

  return runWithIndexedDbLease(sessionRevision, task);
}
