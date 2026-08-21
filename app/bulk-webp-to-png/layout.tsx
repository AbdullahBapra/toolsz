import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bulk WebP to PNG Converter — Batch Convert for Compatibility | Toolsz",
  description:
    "Batch convert multiple WebP images to PNG for universal compatibility. Works in Photoshop, email, and Windows. Download as ZIP. Browser-based, free, no signup.",
  keywords: [
    "bulk webp to png",
    "batch webp to png",
    "batch convert webp png",
    "multiple webp to png",
    "bulk webp converter",
  ],
  openGraph: {
    title: "Bulk WebP to PNG Converter — Batch Convert & Download ZIP",
    description:
      "Convert multiple WebP images to PNG for universal compatibility. Download as ZIP. Free, private, lossless.",
    type: "website",
  },
  alternates: { canonical: "https://www.toolsz.co/bulk-webp-to-png" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
