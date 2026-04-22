import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    API_BASE_URL: process.env.API_BASE_URL,
  },
  async rewrites() {
    if (process.env.NODE_ENV === "production") {
      return [
        {
          source: "/api/:path*",
          destination: `${process.env.API_PROXY_URL}/api/:path*`,
        },
      ];
    } else {
      return [
        {
          source: "/api/:path*",
          destination: "http://localhost:3000/api/v1/:path*",
        },
      ];
    }

    return [];
  },

  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/api/**",
      },
      {
        protocol: "https",
        hostname: process.env.NEXT_PUBLIC_IMAGE_DOMAIN!,
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: process.env.NEXT_PUBLIC_WEBSITE_DOMAIN!,
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
