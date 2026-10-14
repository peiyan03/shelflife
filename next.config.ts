import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next 16 dev writes an AGENTS.md on start; ours is the Codex brief, keep it.
  agentRules: false,
  // Server actions receive receipt photos; the default 1 MB body cap is too small.
  experimental: { serverActions: { bodySizeLimit: '6mb' } },
  // The sample receipt is read from disk by a server action; make sure Vercel bundles it.
  outputFileTracingIncludes: { '/': ['./samples/*.jpg'], '/api/sample': ['./samples/*.jpg'] },
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
