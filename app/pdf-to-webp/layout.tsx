import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free PDF to WebP Converter — No Upload, Web-Optimized | Toolsz",
  description: "Convert PDF pages to WebP images free — no upload, browser-based. WebP output is 25-35% smaller than JPEG at the same quality. Up to 300 DPI. No watermarks.",
  keywords: ["pdf to webp", "convert pdf to webp", "pdf to image webp", "pdf pages webp", "pdf to web format"],
  alternates: { canonical: "https://www.toolsz.co/pdf-to-webp" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
