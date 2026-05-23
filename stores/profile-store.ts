import { getDB, STORE } from "@/lib/db";
import { ProfileResponse } from "@/interfaces/response";

const PROFILE_KEY = "me";

export async function getCachedProfile(): Promise<ProfileResponse | null> {
  try {
    const db = await getDB();
    return (await db.get(STORE.PROFILE, PROFILE_KEY)) ?? null;
  } catch {
    return null;
  }
}

export async function setCachedProfile(profile: ProfileResponse): Promise<void> {
  const db = await getDB();
  await db.put(STORE.PROFILE, profile, PROFILE_KEY);
}

export async function removeCachedProfile(): Promise<void> {
  const db = await getDB();
  await db.delete(STORE.PROFILE, PROFILE_KEY);
}