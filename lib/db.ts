import { openDB, IDBPDatabase } from "idb";

const DB_NAME = "uniwise_db";
const DB_VERSION = 2; // Tăng version tại đây khi thêm store mới

export const STORE = {
  AUTH: "auth",
  PROFILE: "profile",
} as const;

let dbPromise: Promise<IDBPDatabase> | null = null;

/**
 * Singleton — toàn bộ app dùng chung 1 instance DB.
 * Mọi store đều khai báo upgrade() tại đây để tránh version conflict.
 */
export function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        // Mỗi case KHÔNG break để chạy tuần tự từ version cũ lên mới
        switch (oldVersion) {
          case 0:
            db.createObjectStore(STORE.AUTH);
          // falls through
          case 1:
            db.createObjectStore(STORE.PROFILE);
          // falls through
          // case 2: thêm store mới ở đây khi cần
        }
      },
    });
  }
  return dbPromise;
}