"use client";

import { keepPreviousData, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// Hàm tạo QueryClient để đảm bảo không tạo lại client trên mỗi lần render
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        gcTime: 5 * 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: false,
        refetchOnMount: false,        // Áp dụng cho tất cả query
        placeholderData: keepPreviousData, // Giữ data cũ khi navigate
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: Luôn tạo client mới
    return makeQueryClient();
  } else {
    // Browser: Tạo client mới nếu chưa có, dùng lại nếu đã có (Singleton)
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Khởi tạo client bên trong React state để đảm bảo tính an toàn cho Suspense
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
