import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Home dir has a stray package-lock.json + node_modules that confuses
  // Turbopack's workspace-root detection — pin the root to this repo.
  turbopack: { root: __dirname },
};

export default nextConfig;
