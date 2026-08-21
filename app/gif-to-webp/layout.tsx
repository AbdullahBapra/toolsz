import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "GIF to WebP Converter — Free Online Tool",
  description: "Convert GIF to WebP for smaller file sizes and better web performance. Free, private, instant — no upload needed.",
  alternates: { canonical: "https://www.toolsz.co/gif-to-webp" },
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
