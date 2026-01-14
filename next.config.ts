import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: 'http://localhost:3000/uploads/:path*',
      },
      {
        source: '/api/internal/logs',
        destination: 'http://localhost:3000/api/internal/logs',
      },
    ];
  },
};

export default nextConfig;
