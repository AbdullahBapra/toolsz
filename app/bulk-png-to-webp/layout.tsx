import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bulk PNG to WebP Converter — Batch Convert Images for Web | Toolsz",
  description:
    "Batch convert multiple PNG files to WebP format. Reduce image library size by 25-35%. Download all converted files as a ZIP. Browser-based, no uploads, free.",
  keywords: [
    "bulk png to webp",
    "batch png to webp",
    "bulk image to webp",
    "batch convert png webp",
    "multiple png to webp",
  ],
  openGraph: {
    title: "Bulk PNG to WebP Converter — Optimize Your Image Library",
    description:
      "Batch convert PNG to WebP for 25-35% smaller files. Download as ZIP. Free, private, browser-based.",
    type: "website",
  },
  alternates: { canonical: "https://www.toolsz.co/bulk-png-to-webp" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
