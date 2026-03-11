import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5143',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5143/api/:path*', // Proxy to Backend
      },
      {
        source: '/images/:path*',
        destination: 'http://localhost:5143/images/:path*', // Proxy static images
      },
    ]
  },
};

export default nextConfig;
