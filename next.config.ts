import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: "500mb",
    },
    // Proxy buffer 200 MB video và 5 MB metadata multipart; validation thật
    // vẫn do frontend và media-service quyết định.
    proxyClientMaxBodySize: "205mb",
  },
  output: "standalone",
  async rewrites() {
    return [
      {
        // Khi gọi tới /api/proxy/login -> sẽ thực tế gọi tới Backend/login
        source: "/api/proxy/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
