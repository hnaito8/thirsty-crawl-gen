import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emits a self-contained .next/standalone build (minimal node_modules + server.js),
  // which is what the Dockerfile copies into the Cloud Run container image.
  output: "standalone",
};

export default nextConfig;
