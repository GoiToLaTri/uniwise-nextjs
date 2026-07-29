"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTokenRefresh } from "@/hooks/use-token";
import { useSessionSnapshot } from "@/hooks/use-session-snapshot";
import { hasScope } from "@/lib/scope";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const session = useSessionSnapshot();
  const authorized =
    session !== undefined &&
    session !== null &&
    hasScope(session.tokenResponse.scope, "ROLE_ADMIN");
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

  return <>{children}</>;
}
