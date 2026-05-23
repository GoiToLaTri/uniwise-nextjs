import { TokenResponse } from "@/interfaces/response";

export async function syncAccessTokenCookie(tokenResponse: TokenResponse): Promise<void> {
    console.log(":::: token response", tokenResponse);
    await fetch("/api/auth/token", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tokenResponse),
    });
  }
   
export  async function clearAccessTokenCookie(): Promise<void> {
    await fetch("/api/auth/token", { method: "DELETE",credentials: "include",  });
  }