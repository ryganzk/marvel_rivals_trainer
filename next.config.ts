import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
};

export default nextConfig;
