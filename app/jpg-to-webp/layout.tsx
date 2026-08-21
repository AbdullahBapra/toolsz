import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free JPG to WebP Converter — 25-34% Smaller, No Upload | Toolsz",
  description:
    "Convert JPG to WebP free online. WebP is 25-34% smaller than JPEG at equivalent quality. Boost PageSpeed & Core Web Vitals. Browser-based — no uploads, no signup.",
  keywords: [
    "jpg to webp",
    "jpeg to webp",
    "convert jpg to webp",
    "jpg to webp converter",
    "jpeg to webp converter",
    "free jpg to webp",
  ],
  openGraph: {
    title: "Free JPG to WebP Converter — Optimize Photos for the Web",
    description:
      "Convert JPEG to WebP for smaller file sizes and better Core Web Vitals. Free, private, instant — no upload required.",
    type: "website",
  },
  alternates: { canonical: "https://www.toolsz.co/jpg-to-webp" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
