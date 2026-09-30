import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next.js 16 uses Turbopack by default. MapLibre GL workers load fine via Turbopack.
  // Setting turbopack:{} explicitly silences the webpack-vs-turbopack warning.
  turbopack: {},
  // Allow images from OSM tiles and Unsplash for demo photos
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.openstreetmap.org" },
      { protocol: "https", hostname: "**.unsplash.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
