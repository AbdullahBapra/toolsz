import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bulk Image Resizer — Free Online Tool | Toolsz",
  description:
    "Resize multiple images at once to any dimensions. Choose Contain, Cover, or Stretch fit mode. Download as ZIP. Browser-based — no uploads, no signup.",
  keywords: [
    "bulk image resizer",
    "batch resize images",
    "resize multiple images",
    "batch image resize online",
    "resize images to same size",
  ],
  openGraph: {
    title: "Bulk Image Resizer — Free Online Tool",
    description:
      "Resize multiple images at once to any dimensions with fit mode options. Download as ZIP. Free, private, no limits.",
    type: "website",
  },
  alternates: { canonical: "https://www.toolsz.co/bulk-image-resizer" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
