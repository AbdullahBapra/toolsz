import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bulk Image Converter — Convert Multiple Images at Once | Toolsz",
  description:
    "Convert multiple images to WebP at once. Batch convert JPG, PNG, BMP, GIF, AVIF to WebP for faster websites. Download as ZIP. Browser-based — no uploads, no signup.",
  keywords: [
    "bulk image converter",
    "batch image converter",
    "convert multiple images to webp",
    "bulk convert to webp",
    "batch webp converter",
  ],
  openGraph: {
    title: "Bulk Image Converter — Convert Multiple Images at Once",
    description:
      "Batch convert multiple images to WebP at once. Download as ZIP. Free, private, no limits.",
    type: "website",
  },
  alternates: { canonical: "https://www.toolsz.co/bulk-image-converter" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
