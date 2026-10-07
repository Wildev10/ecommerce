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
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'loremflickr.com',
      },
      {
        // CDN Flickr (loremflickr redirige ici)
        protocol: 'https',
        hostname: '*.staticflickr.com',
      },
    ],
  },
};

export default nextConfig;
