"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTokenRefresh } from "@/hooks/use-token";
import { UserNavbar } from "./_components/user-navbar";
import { useSessionSnapshot } from "@/hooks/use-session-snapshot";
import { hasScope } from "@/lib/scope";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const session = useSessionSnapshot();
  const authorized =
    session !== undefined &&
    session !== null &&
    hasScope(session.tokenResponse.scope, "ROLE_USER");

  useEffect(() => {
    if (session === undefined) return;

    if (!session) {
      router.replace("/signin");
      return;
    }

    if (!authorized) {
      router.replace("/forbidden");
    }
  }, [authorized, router, session]);

  useTokenRefresh();
  
  if (!authorized) return null; // hoặc <LoadingSpinner />

  // Bỏ qua layout và navbar chung nếu đang ở trang partners
  if (pathname?.startsWith("/partners")) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased flex flex-col">
      <UserNavbar />
      <div className="flex-1 flex flex-col w-full">
        {children}
      </div>
    </div>
  );
}
