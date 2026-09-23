import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/gtag/js",
        destination: "https://www.googletagmanager.com/gtag/js",
      },
      {
        source: "/g/collect",
        destination: "https://www.google-analytics.com/g/collect",
      },
      {
        source: "/j/collect",
        destination: "https://www.google-analytics.com/j/collect",
      },
    ];
  },
};

export default nextConfig;
