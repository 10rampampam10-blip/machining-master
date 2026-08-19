import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "マシニングマスター",

    short_name: "マシニングマスター",

    description: "技能検定 機械加工 学科対策アプリ",

    start_url: "/",

    display: "standalone",

    background_color: "#09090b",

    theme_color: "#09090b",

    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}