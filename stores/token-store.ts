import { TokenResponse } from "@/interfaces/response/token-response.interface";
import { readSessionSnapshot } from "@/lib/session-repository";

export async function getTokenResponse(): Promise<TokenResponse | null> {
  try {
    const snapshot = await readSessionSnapshot();
    return snapshot?.tokenResponse ?? null;
  } catch {
    return null;
  }
}

export async function getToken(): Promise<string | null> {
  const tokenResponse = await getTokenResponse();
  return tokenResponse?.accessToken ?? null;
}

// Xem token là hết hạn sớm 30 giây để nó không hết hạn giữa lúc gửi request.
const EXPIRY_BUFFER_MS = 30 * 1000;

/**
 * Kiểm tra TokenResponse đã hết hạn hoặc còn dưới 30 giây hay chưa.
 * Hàm nhận token có sẵn nên không cần đọc lại IndexedDB.
 */
export function isTokenResponseExpired(
  tokenResponse: TokenResponse,
): boolean {
  const expiresAt = new Date(tokenResponse.expiresAt).getTime();
  return expiresAt - EXPIRY_BUFFER_MS <= Date.now();
}

export async function isTokenExpired(): Promise<boolean> {
  const tokenResponse = await getTokenResponse();
  if (!tokenResponse) return true;
  return isTokenResponseExpired(tokenResponse);
}
