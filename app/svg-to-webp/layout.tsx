import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "SVG to WebP Converter — Free Online Tool",
  description: "Convert SVG vector to WebP raster format online. Free, private, instant — no upload needed.",
  alternates: { canonical: "https://www.toolsz.co/svg-to-webp" },
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
