import type { Metadata, Viewport } from "next";
import "maplibre-gl/dist/maplibre-gl.css";
import "./globals.css";

import Navbar from "@/components/Navbar";
import ChatBot from "@/components/ChatBot";

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
    <html lang="en" style={{ width: "100%", height: "100%" }} suppressHydrationWarning>
      <head />
      <body
        style={{
          width: "100%",
          minHeight: "100dvh",
          margin: 0,
          padding: 0,
          overflowX: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
        suppressHydrationWarning
      >
        <Navbar />
        <main style={{ flex: 1, display: "flex", flexDirection: "column", width: "100%", minWidth: 0, minHeight: 0 }}>
          {children}
        </main>
        <ChatBot />
      </body>
    </html>
  );
}

