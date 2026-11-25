import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static HTML in out/, served by nginx on the VPS (no Node runtime there).
  output: "export",
  // No /_next/image optimizer without a Node server: serve image files as-is.
  images: { unoptimized: true },
  // cacheComponents/partialPrefetching removed: PPR is not allowed in export mode.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
