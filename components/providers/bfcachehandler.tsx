'use client';

import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export function BFCacheHandler() {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        // Invalidate all queries khi restore từ bfcache
        queryClient.invalidateQueries();
      }
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, [queryClient]);
  
  return null;
}