import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE } from "./constant";

// Exact match — chỉ đúng path đó mới là public
const PUBLIC_EXACT: string[] = ["/"];

// Prefix match — path bắt đầu bằng những này là public
const PUBLIC_PREFIXES = ["/signin", "/signup", "/unauthorized"];

const ADMIN_PREFIXES = ["/admin"];

const IGNORED_PREFIXES = ["/api/", "/_next/", "/favicon.ico"];

function isPublicRoute(pathname: string): boolean {
  return (
    PUBLIC_EXACT.includes(pathname) ||
    PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Bỏ qua internal routes
  if (IGNORED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get(AUTH_COOKIE.ACCESS_TOKEN)?.value;
  const isPublic = isPublicRoute(pathname);
  const isAdmin = ADMIN_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  // Public route + đã login → redirect dashboard
  // Nhưng "/" thì cho ở lại (landing page ai cũng xem được)
  if (isPublic && accessToken && pathname !== "/") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Protected route + chưa login → redirect signin
  if (!isPublic && !accessToken) {
    const signinUrl = new URL("/signin", request.url);
    signinUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(signinUrl);
  }

  // Admin route + chưa login → unauthorized (client layout sẽ check role)
  if (isAdmin && !accessToken) {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};