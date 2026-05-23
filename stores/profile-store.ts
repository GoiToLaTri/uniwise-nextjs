import { ProfileResponse } from "@/interfaces/response";
import { openDB } from "idb";

const DB_NAME = "uniwise_db";
const STORE_NAME = "profile";
const PROFILE_KEY = "me";
const DB_VERSION = 1;

function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    },
  });
}

export async function getCachedProfile(): Promise<ProfileResponse | null> {
  try {
    const db = await getDB();
    return (await db.get(STORE_NAME, PROFILE_KEY)) ?? null;
  } catch {
    return null;
  }
}

export async function setCachedProfile(profile: ProfileResponse): Promise<void> {
  const db = await getDB();
  await db.put(STORE_NAME, profile, PROFILE_KEY);
}

export async function removeCachedProfile(): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_NAME, PROFILE_KEY);
}