import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "WebP to SVG Converter — Free Vector Tracing Tool",
  description: "Convert WebP to SVG online. Pixel-perfect embedding or full vector tracing. Free, private, instant — no upload needed.",
  alternates: { canonical: "https://www.toolsz.co/webp-to-svg" },
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
