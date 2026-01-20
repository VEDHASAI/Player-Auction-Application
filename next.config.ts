import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: isProd ? '/Player-Auction-Application' : '',
  assetPrefix: isProd ? '/Player-Auction-Application/' : '',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
