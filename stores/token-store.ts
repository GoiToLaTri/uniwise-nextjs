import { TokenResponse } from "@/interfaces/response/token-response.interface";
import { getDB, STORE } from "@/lib/db";

const TOKEN_KEY = "session";

export async function getTokenResponse(): Promise<TokenResponse | null> {
  try {
    const db = await getDB();
    return (await db.get(STORE.AUTH, TOKEN_KEY)) ?? null;
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
  await db.put(STORE.AUTH, tokenResponse, TOKEN_KEY);
}

export async function removeToken(): Promise<void> {
  const db = await getDB();
  await db.delete(STORE.AUTH, TOKEN_KEY);
}

// Buffer 30s để tránh race condition: token còn hạn ở client
// nhưng request bay lên thì Redis đã expire
const EXPIRY_BUFFER_MS = 30 * 1000;
 
export async function isTokenExpired(): Promise<boolean> {
  const tokenResponse = await getTokenResponse();
  if (!tokenResponse) return true;
  const expiresAt = new Date(tokenResponse.expiresAt).getTime();
  return expiresAt - EXPIRY_BUFFER_MS <= Date.now();
}