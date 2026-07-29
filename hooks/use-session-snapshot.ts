"use client";

import { useEffect, useState } from "react";
import {
  readSessionSnapshot,
  type SessionSnapshot,
} from "@/lib/session-repository";
import {
  retainSessionEventBridge,
  SESSION_CLEARED_EVENT,
  SESSION_UPDATED_EVENT,
} from "@/lib/session-events";

/**
 * Đọc session và tự đọc lại khi tab hiện tại hoặc tab khác thay đổi session.
 *
 * - `undefined`: đang đọc IndexedDB lần đầu.
 * - `null`: không có session.
 * - `SessionSnapshot`: đã đăng nhập.
 */
export function useSessionSnapshot():
  | SessionSnapshot
  | null
  | undefined {
  const [snapshot, setSnapshot] = useState<
    SessionSnapshot | null | undefined
  >(undefined);

  useEffect(() => {
    let disposed = false;

    async function reloadSnapshot() {
      try {
        const nextSnapshot = await readSessionSnapshot();
        if (!disposed) setSnapshot(nextSnapshot);
      } catch (error) {
        console.error("[useSessionSnapshot] Không thể đọc session:", error);
        if (!disposed) setSnapshot(null);
      }
    }

    function handleSessionUpdated() {
      void reloadSnapshot();
    }

    function handleSessionCleared() {
      setSnapshot(null);
    }

    const releaseBridge = retainSessionEventBridge();
    window.addEventListener(SESSION_UPDATED_EVENT, handleSessionUpdated);
    window.addEventListener(SESSION_CLEARED_EVENT, handleSessionCleared);
    void reloadSnapshot();

    return () => {
      disposed = true;
      window.removeEventListener(
        SESSION_UPDATED_EVENT,
        handleSessionUpdated,
      );
      window.removeEventListener(
        SESSION_CLEARED_EVENT,
        handleSessionCleared,
      );
      releaseBridge();
    };
  }, []);

  return snapshot;
}
