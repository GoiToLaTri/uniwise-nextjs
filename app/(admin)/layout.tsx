"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getTokenResponse } from "@/stores/token-store";
import { useTokenRefresh } from "@/hooks/use-token";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  
  const router = useRouter();

  useEffect(() => {
    getTokenResponse().then((token) => {
      const isAdmin = token?.scope?.includes("ROLE_ADMIN") ?? false;
      if (!isAdmin) router.replace("/forbidden");
    });
  }, [router]);
  
  useTokenRefresh()
  return <>{children}</>;
}