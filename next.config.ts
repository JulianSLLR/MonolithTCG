import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'assets.tcgdex.net', // Le serveur d'images de TCGDex
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
