import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@solana/kit/program-client-core": require.resolve("@solana/kit"),
    };
    return config;
  },
  turbopack: {
    resolveAlias: {
      "@solana/kit/program-client-core": "@solana/kit",
    },
  },
};

export default nextConfig;