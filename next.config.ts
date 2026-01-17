import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  turbopack: {},
  webpack: (config) => {
    config.cache = false;
    config.plugins = config.plugins?.filter((plugin: any) => {
      const name = plugin.constructor.name;
      return !name.includes("Cache");
    });
    return config;
  },
  outputFileTracingExcludes: {
    "*": ["cache/**/*", "**/cache/**/*", ".next/cache/**/*"],
  },
  experimental: {
    webpackBuildWorker: false,
  },
};

export default nextConfig;
