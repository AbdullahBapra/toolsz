import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "AVIF to PNG Converter — Free Online Tool",
  description: "Convert AVIF to PNG for universal compatibility. Lossless PNG output, free, private, instant — no upload needed.",
  alternates: { canonical: "https://www.toolsz.co/avif-to-png" },
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
