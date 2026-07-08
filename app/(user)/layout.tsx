"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getTokenResponse } from "@/stores/token-store";
import { useTokenRefresh } from "@/hooks/use-token";
import { UserNavbar } from "./_components/user-navbar";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
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