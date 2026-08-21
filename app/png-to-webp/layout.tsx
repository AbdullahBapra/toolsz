import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free PNG to WebP Converter — Reduce File Size 25-35% | Toolsz",
  description:
    "Convert PNG to WebP free online. WebP is 25-35% smaller than PNG with same quality. Preserves transparency. 100% browser-based — no uploads, no signup.",
  keywords: [
    "png to webp",
    "convert png to webp",
    "png to webp converter",
    "free png to webp",
    "png webp conversion",
  ],
  openGraph: {
    title: "Free PNG to WebP Converter — 25-35% Smaller Files",
    description:
      "Convert PNG to WebP for better web performance. Smaller files, full transparency support. Free, private, instant.",
    type: "website",
  },
  alternates: { canonical: "https://www.toolsz.co/png-to-webp" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
