import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bulk Image Compressor — Free Online Tool | Toolsz",
  description:
    "Compress multiple images at once with adjustable quality. Reduce file sizes for JPG, PNG, WebP, GIF, AVIF, BMP. Download as ZIP. Browser-based — no uploads, no signup.",
  keywords: [
    "bulk image compressor",
    "batch image compression",
    "compress multiple images",
    "image optimizer online",
    "reduce image size",
  ],
  openGraph: {
    title: "Bulk Image Compressor — Free Online Tool",
    description:
      "Compress multiple images at once with adjustable quality. Download all as ZIP. Free, private, no limits.",
    type: "website",
  },
  alternates: { canonical: "https://www.toolsz.co/bulk-image-compressor" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
