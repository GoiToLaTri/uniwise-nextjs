import { retainTokenRefreshScheduler } from "@/lib/token-refresh-scheduler";
import { useEffect } from "react";

/**
 * Bật scheduler kiểm tra token cho layout hiện tại.
 * Nhiều layout gọi hook này vẫn chỉ tạo một scheduler trong tab.
 */
export function useTokenRefresh() {
  useEffect(() => retainTokenRefreshScheduler(), []);
}
