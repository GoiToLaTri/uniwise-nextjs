"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getTokenResponse } from "@/stores/token-store";
import { useTokenRefresh } from "@/hooks/use-token";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    getTokenResponse().then((token) => {
      const isUser = token?.scope?.includes("ROLE_USER") ?? false;
      if (!isUser) {
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