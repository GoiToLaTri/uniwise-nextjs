"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTokenRefresh } from "@/hooks/use-token";
import { Loader2 } from "lucide-react";
import { useSessionSnapshot } from "@/hooks/use-session-snapshot";
import { hasScope } from "@/lib/scope";

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
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
