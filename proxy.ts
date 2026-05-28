import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE } from "./constant";

// Bỏ qua hoàn toàn — proxy không xử lý
const IGNORED_PREFIXES = ["/api/", "/_next/", "/favicon.ico"];

// Chỉ cho vào khi chưa login (login rồi → redirect /dashboard)
const AUTH_ONLY_ROUTES = ["/signin", "/signup"];

// Public hoàn toàn — ai cũng vào được dù đã login hay chưa
const PUBLIC_ROUTES = ["/", "/unauthorized", "/u"];

// Chỉ ROLE_ADMIN mới vào được (client layout tự check role)
const ADMIN_ROUTES = ["/admin"];

function matchesAny(pathname: string, routes: string[]): boolean {
  return routes.some((route) =>
    route === "/" ? pathname === "/" : pathname.startsWith(route),
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log(
    "[proxy]",
    pathname,
    "| token:",
    request.cookies.get(AUTH_COOKIE.ACCESS_TOKEN)?.value ? "EXISTS" : "MISSING",
  );
  if (matchesAny(pathname, IGNORED_PREFIXES)) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get(AUTH_COOKIE.ACCESS_TOKEN)?.value;

  // Auth-only routes: login rồi → redirect /dashboard
  // Auth-only routes
  if (matchesAny(pathname, AUTH_ONLY_ROUTES)) {
    if (accessToken) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next(); // ← không có token thì cho vào bình thường
  }

  // Public routes: ai cũng vào được
  if (matchesAny(pathname, PUBLIC_ROUTES)) {
    return NextResponse.next();
  }

  // Protected routes: chưa login → redirect /signin kèm ?redirect=
  if (!accessToken) {
    const signinUrl = new URL("/signin", request.url);
    signinUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(signinUrl);
  }

  // Admin routes: chưa login → /unauthorized (client layout tự check role)
  if (matchesAny(pathname, ADMIN_ROUTES) && !accessToken) {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
