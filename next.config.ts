import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
  },
});

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

export default withPWA(nextConfig);