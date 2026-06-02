"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getTokenResponse } from "@/stores/token-store";
import { useTokenRefresh } from "@/hooks/use-token";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  // console.log("[AdminLayout] :::: authorized", authorized);
  useEffect(() => {
    getTokenResponse().then(async (token) => {
      // console.log("[AdminLayout] :::: token", await getTokenResponse());
      const isAdmin = token?.scope?.includes("ROLE_ADMIN") ?? false;
      if (!isAdmin) {
        router.replace("/forbidden");
      } else {
        setAuthorized(true);
      }
    });
  }, [router]);

  useTokenRefresh();
  
  if (!authorized) return null; // hoặc <LoadingSpinner />

  return <>{children}</>;
}