import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bulk JPG to WebP Converter — Batch Optimize Photos for Web | Toolsz",
  description:
    "Batch convert multiple JPEG photos to WebP format. Reduce your image library size by 25-34%. Download all as ZIP. Browser-based, free, no signup required.",
  keywords: [
    "bulk jpg to webp",
    "batch jpg to webp",
    "bulk jpeg to webp",
    "batch convert jpg webp",
    "multiple jpg to webp",
  ],
  openGraph: {
    title: "Bulk JPG to WebP Converter — Optimize Your Photo Library",
    description:
      "Batch convert JPEG photos to WebP for 25-34% smaller files. Download as ZIP. Free, private, browser-based.",
    type: "website",
  },
  alternates: { canonical: "https://www.toolsz.co/bulk-jpg-to-webp" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
