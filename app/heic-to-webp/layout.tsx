import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "HEIC to WebP Converter — Free Online Tool",
  description: "Convert iPhone HEIC photos to WebP for smaller file sizes. Free, private, instant — uses our multi-format HEIC converter.",
  alternates: { canonical: "https://www.toolsz.co/heic-to-webp" },
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
