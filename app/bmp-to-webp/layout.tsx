import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "BMP to WebP Converter — Free Online Tool",
  description: "Convert BMP to WebP for superior compression with great quality. Free, private, instant — no upload needed.",
  alternates: { canonical: "https://www.toolsz.co/bmp-to-webp" },
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
