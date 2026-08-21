import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bulk JPG to PNG Converter — Batch Convert Photos to PNG | Toolsz",
  description:
    "Batch convert multiple JPG/JPEG files to PNG at once. Get lossless PNG output for all your images. Download as ZIP. Browser-based — no uploads, no signup.",
  keywords: [
    "bulk jpg to png",
    "batch jpg to png",
    "bulk jpeg to png",
    "batch convert jpg png",
    "multiple jpg to png",
  ],
  openGraph: {
    title: "Bulk JPG to PNG Converter — Batch Convert & Download ZIP",
    description:
      "Convert multiple JPG files to PNG at once. Lossless output, download as ZIP. Free, private, no limits.",
    type: "website",
  },
  alternates: { canonical: "https://www.toolsz.co/bulk-jpg-to-png" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
