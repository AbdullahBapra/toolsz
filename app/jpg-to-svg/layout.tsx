import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "JPG to SVG Converter — Free Vector Tracing Tool",
  description: "Convert JPG to SVG online. Pixel-perfect embedding or full vector tracing with 4 modes. Free, private, instant — no upload needed.",
  alternates: { canonical: "https://www.toolsz.co/jpg-to-svg" },
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
