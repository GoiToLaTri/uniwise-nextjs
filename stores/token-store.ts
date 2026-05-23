import { openDB } from "idb";
import { TokenResponse } from "@/interfaces/response/token-response.interface";

const DB_NAME = "uniwise_db";
const STORE_NAME = "auth";
const TOKEN_KEY = "session";
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

export async function getTokenResponse(): Promise<TokenResponse | null> {
  try {
    const db = await getDB();
    return (await db.get(STORE_NAME, TOKEN_KEY)) ?? null;
  } catch {
    return null;
  }
}

export async function getToken(): Promise<string | null> {
  const tokenResponse = await getTokenResponse();
  return tokenResponse?.accessToken ?? null;
}

export async function setTokenResponse(tokenResponse: TokenResponse): Promise<void> {
  const db = await getDB();
  await db.put(STORE_NAME, tokenResponse, TOKEN_KEY);
}

export async function removeToken(): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_NAME, TOKEN_KEY);
}