import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "prisma"],
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...config.externals, "prisma", "@prisma/client"];
    }
    return config;
  },
};

export default nextConfig;
