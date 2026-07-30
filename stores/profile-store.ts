import { getDB, STORE } from "@/lib/db";
import { ProfileResponse } from "@/interfaces/response";

const PROFILE_KEY = "me";

/** Chỉ đọc profile đầy đủ của tài khoản đang đăng nhập. */
export async function getCachedProfile(): Promise<ProfileResponse | null> {
  try {
    const db = await getDB();
    return (await db.get(STORE.PROFILE, PROFILE_KEY)) ?? null;
  } catch {
    return null;
  }
}

/** Chỉ lưu ProfileResponse từ `/profiles/me`, không lưu profile public. */
export async function setCachedProfile(profile: ProfileResponse): Promise<void> {
  const db = await getDB();
  await db.put(STORE.PROFILE, profile, PROFILE_KEY);
}

/** Xóa profile chính chủ đã cache khi logout hoặc session không còn hợp lệ. */
export async function removeCachedProfile(): Promise<void> {
  const db = await getDB();
  await db.delete(STORE.PROFILE, PROFILE_KEY);
}
