import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Server actions receive receipt photos; the default 1 MB body cap is too small.
  experimental: { serverActions: { bodySizeLimit: '6mb' } },
  // The sample receipt is read from disk by a server action; make sure Vercel bundles it.
  outputFileTracingIncludes: { '/': ['./samples/*.jpg'] },
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
