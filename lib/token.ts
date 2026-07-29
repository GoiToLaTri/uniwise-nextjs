import { TokenResponse } from "@/interfaces/response";

export async function syncAccessTokenCookie(
  tokenResponse: TokenResponse,
): Promise<void> {
  const response = await fetch("/api/auth/token", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(tokenResponse),
  });

  if (!response.ok) {
    throw new Error(`Không thể đồng bộ access-token cookie (${response.status})`);
  }
}

export async function clearAccessTokenCookie(): Promise<void> {
  const response = await fetch("/api/auth/token", {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Không thể xóa access-token cookie (${response.status})`);
  }
}
