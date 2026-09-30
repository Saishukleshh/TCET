import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
