import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CarreiraPro",
    short_name: "CarreiraPro",
    description:
      "Pratique perguntas, organize respostas pelo método STAR e treine entrevistas com feedback.",
    start_url: "/app",
    display: "standalone",
    background_color: "#F8FAFC",
    theme_color: "#0F172A",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
