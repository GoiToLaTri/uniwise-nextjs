export const SESSION_UPDATED_EVENT = "uniwise:session-updated";
export const SESSION_CLEARED_EVENT = "uniwise:session-cleared";

const SESSION_CHANNEL_NAME = "uniwise:auth:session";

export type SessionUpdateReason = "login" | "refresh";
export type SessionClearReason = "logout" | "refresh-failure" | "unknown";
export type SessionEventOrigin = "local" | "broadcast";

export interface SessionUpdatedEventDetail {
  revision: number;
  reason: SessionUpdateReason;
  origin: SessionEventOrigin;
}

export interface SessionClearedEventDetail {
  reason: SessionClearReason;
  origin: SessionEventOrigin;
}

type SessionChannelMessage =
  | {
      type: "session-updated";
      revision: number;
      reason: SessionUpdateReason;
    }
  | {
      type: "session-cleared";
      reason: SessionClearReason;
    };

let sessionChannel: BroadcastChannel | null = null;
let bridgeSubscriberCount = 0;

/**
 * Kiểm tra thông báo từ tab khác có đúng cấu trúc cho phép không.
 * Thông báo lạ hoặc chứa dữ liệu ngoài contract sẽ bị bỏ qua.
 */
function isSessionChannelMessage(
  value: unknown,
): value is SessionChannelMessage {
  if (typeof value !== "object" || value === null) return false;

  const message = value as Record<string, unknown>;

  if (message.type === "session-updated") {
    return (
      typeof message.revision === "number" &&
      (message.reason === "login" || message.reason === "refresh")
    );
  }

  if (message.type === "session-cleared") {
    return (
      message.reason === "logout" ||
      message.reason === "refresh-failure" ||
      message.reason === "unknown"
    );
  }

  return false;
}

/**
 * Báo cho code trong tab hiện tại rằng session vừa thay đổi.
 */
function dispatchSessionUpdated(
  revision: number,
  reason: SessionUpdateReason,
  origin: SessionEventOrigin,
): void {
  window.dispatchEvent(
    new CustomEvent<SessionUpdatedEventDetail>(SESSION_UPDATED_EVENT, {
      detail: { revision, reason, origin },
    }),
  );
}

/**
 * Báo cho code trong tab hiện tại rằng session vừa bị xóa.
 */
function dispatchSessionCleared(
  reason: SessionClearReason,
  origin: SessionEventOrigin,
): void {
  window.dispatchEvent(
    new CustomEvent<SessionClearedEventDetail>(SESSION_CLEARED_EVENT, {
      detail: { reason, origin },
    }),
  );
}

/**
 * Nhận thông báo từ tab khác rồi phát lại thành event trong tab hiện tại.
 * Không gửi ngược lại để tránh các tab truyền message vòng lặp.
 */
function handleSessionChannelMessage(event: MessageEvent<unknown>): void {
  if (!isSessionChannelMessage(event.data)) return;

  if (event.data.type === "session-updated") {
    dispatchSessionUpdated(
      event.data.revision,
      event.data.reason,
      "broadcast",
    );
    return;
  }

  dispatchSessionCleared(event.data.reason, "broadcast");
}

/**
 * Mở kênh liên lạc giữa các tab nếu trình duyệt hỗ trợ BroadcastChannel.
 */
function openSessionChannel(): BroadcastChannel | null {
  if (
    typeof window === "undefined" ||
    typeof BroadcastChannel === "undefined"
  ) {
    return null;
  }

  if (!sessionChannel) {
    sessionChannel = new BroadcastChannel(SESSION_CHANNEL_NAME);
    sessionChannel.addEventListener("message", handleSessionChannelMessage);
  }

  return sessionChannel;
}

/**
 * Gửi thông báo sang tab khác.
 * Nếu tab hiện tại chưa mở channel, tạo channel tạm, gửi xong rồi đóng.
 */
function broadcastSessionMessage(message: SessionChannelMessage): void {
  if (
    typeof window === "undefined" ||
    typeof BroadcastChannel === "undefined"
  ) {
    return;
  }

  if (sessionChannel) {
    sessionChannel.postMessage(message);
    return;
  }

  const temporaryChannel = new BroadcastChannel(SESSION_CHANNEL_NAME);
  temporaryChannel.postMessage(message);
  globalThis.setTimeout(() => temporaryChannel.close(), 0);
}

/**
 * Báo session đã thay đổi cho tab hiện tại và các tab khác.
 * Chỉ gửi revision/lý do; mỗi tab tự đọc token mới từ IndexedDB.
 */
export function emitSessionUpdated(
  revision: number,
  reason: SessionUpdateReason,
): void {
  if (typeof window === "undefined") return;

  dispatchSessionUpdated(revision, reason, "local");
  broadcastSessionMessage({
    type: "session-updated",
    revision,
    reason,
  });
}

/**
 * Báo session đã bị xóa cho tab hiện tại và các tab khác.
 * Thông báo không chứa token.
 */
export function emitSessionCleared(
  reason: SessionClearReason = "unknown",
): void {
  if (typeof window === "undefined") return;

  dispatchSessionCleared(reason, "local");
  broadcastSessionMessage({
    type: "session-cleared",
    reason,
  });
}

/**
 * Dùng chung một BroadcastChannel cho nhiều nơi trong cùng tab.
 * Channel chỉ đóng khi không còn nơi nào sử dụng.
 */
export function retainSessionEventBridge(): () => void {
  bridgeSubscriberCount += 1;
  openSessionChannel();

  let released = false;

  return () => {
    if (released) return;
    released = true;
    bridgeSubscriberCount = Math.max(0, bridgeSubscriberCount - 1);

    if (bridgeSubscriberCount === 0 && sessionChannel) {
      sessionChannel.removeEventListener(
        "message",
        handleSessionChannelMessage,
      );
      sessionChannel.close();
      sessionChannel = null;
    }
  };
}
