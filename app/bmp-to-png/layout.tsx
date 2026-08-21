import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "BMP to PNG Converter — Free Online Tool",
  description: "Convert BMP to PNG online. Lossless compression, smaller files than BMP. Free, private, instant — no upload needed.",
  alternates: { canonical: "https://www.toolsz.co/bmp-to-png" },
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
