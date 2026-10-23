import type { NextConfig } from "next";
import path from "path";

const backendUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api').replace(/\/$/, '');

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname, "../"),
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/:path*`
      }
    ];
  }
};

export default nextConfig;
