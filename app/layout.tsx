import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "sonner";
import { BFCacheHandler } from "@/components/providers/bfcachehandler";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "UNIWISE - Learning",
  description: "Nền tảng học tập trực tuyến",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* React Query Provider bao phủ toàn cục */}
        <QueryProvider>
          {children}
          {/* Cấu hình Sonner đồng bộ với Design System */}
          <Toaster
            position="top-right"
            expand={false}
            richColors
            toastOptions={{
              className: "rounded-xl font-sans border-slate-200 shadow-lg",
              style: { borderRadius: "0.625rem" },
            }}
          />
          <BFCacheHandler />
        </QueryProvider>
      </body>
    </html>
  );
}
