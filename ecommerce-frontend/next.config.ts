import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.1.31'],
  images: {
    remotePatterns: [
      {
        // API locale (dev)
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/storage/**',
      },
      {
        // API de production — adapter le hostname au déploiement
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_API_HOSTNAME ?? 'api.tondomaine.com',
        pathname: '/storage/**',
      },
      {
        // Images placeholder seedées (dev uniquement)
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
  },
};

export default nextConfig;
