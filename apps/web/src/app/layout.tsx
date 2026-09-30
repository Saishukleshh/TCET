import type { Metadata, Viewport } from "next";
import "maplibre-gl/dist/maplibre-gl.css";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#F0E3CE",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: {
    default: "AEGISFLOW — Intelligent Urban Flood Prediction & Disaster Management",
    template: "%s | AEGISFLOW",
  },
  description:
    "Real-time urban flood detection, AI verification, dynamic evacuation routing, and resource allocation. Ukiyo-e Woodblock Revival design.",
  keywords: [
    "flood management",
    "disaster response",
    "urban resilience",
    "evacuation routing",
    "smart city",
    "Mumbai",
  ],
  authors: [{ name: "Team AEGISFLOW" }],
  openGraph: {
    title: "AEGISFLOW — Intelligent Disaster Management",
    description:
      "From warning to response. Detect earlier. Verify better. Route safer. Respond together.",
    siteName: "AEGISFLOW",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head />
      <body>{children}</body>
    </html>
  );
}
