"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getTokenResponse } from "@/stores/token-store";
import { useTokenRefresh } from "@/hooks/use-token";
import { Loader2 } from "lucide-react";

export default function LearnLayout({ children }: { children: React.ReactNode }) {
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
  
  if (!authorized) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-slate-50 font-sans antialiased overflow-hidden flex flex-col">
      {children}
    </div>
  );
}
