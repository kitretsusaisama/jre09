import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/:path*/index',
        destination: '/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
