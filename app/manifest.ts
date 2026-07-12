import type { MetadataRoute } from "next";

// Web App Manifest (PWA Nível 1 — instalável, sem offline).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Diarista Perto de Mim",
    short_name: "Diarista PDM",
    description: "Encontre diaristas perto de você",
    start_url: "/",
    display: "standalone",
    background_color: "#F7F5F0",
    theme_color: "#0E6B5C",
    orientation: "portrait",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
