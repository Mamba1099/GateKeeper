import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["@prisma/client", "prisma"],
  images: {
    unoptimized: true,
  },
  turbopack: {},
};

export default nextConfig;
