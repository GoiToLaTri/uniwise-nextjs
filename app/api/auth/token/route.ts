import { NextRequest, NextResponse } from "next/server";
import { TokenResponse } from "@/interfaces/response/token-response.interface";
import { AUTH_COOKIE } from "@/constant";

/**
 * POST /api/auth/token — set access token cookie sau khi login/refresh
 * DELETE /api/auth/token — xóa cookie khi logout
 */

export async function POST(request: NextRequest) {
  const body: TokenResponse = await request.json();
  const response = NextResponse.json({ ok: true });
  const IS_PRODUCTION = process.env.NODE_ENV === "production";

  response.cookies.set(AUTH_COOKIE.ACCESS_TOKEN, body.accessToken, {
    httpOnly: true,
    sameSite: "lax",  // VNPay callback from external domain requires lax or none
    secure: IS_PRODUCTION,
    expires: new Date(body.expiresAt),
    path: "/",
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(AUTH_COOKIE.ACCESS_TOKEN);
  return response;
}