import type { NextConfig } from "next";

const nextConfig = {
  // Improve dev auto-refresh on Windows/WSL by enabling polling-based file watch.
  // This helps when native file events are unreliable (e.g., Docker, network drives).
  webpack: (config, { isServer, dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
  // Empty turbopack config to silence Next.js 16 warning
  turbopack: {},
  
  // Configure WebSocket URL for HMR when using -H 0.0.0.0
  // This allows HMR to work properly when accessing from different hostnames
  experimental: {
    webVitalsAttribution: ['CLS', 'LCP'],
  },
  // Allow dev assets to be requested from alternate hosts (localhost vs 127.0.0.1)
  // This future-proofs against Next.js tightening cross-origin dev requests.
  // Note: Current Next.js may ignore this field; it's safe to keep.
  allowedDevOrigins: [
    "http://127.0.0.1:3000",
    "http://localhost:3000",
  ],
} satisfies NextConfig;

export default nextConfig;
