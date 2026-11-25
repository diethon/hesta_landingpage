import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static HTML in out/, served by nginx on the VPS (no Node runtime there).
  output: "export",
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
