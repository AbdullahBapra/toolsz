import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "TIFF to PNG Converter — Guide & Free Tools",
  description: "Convert TIFF to PNG online. Learn the best free tools for TIFF conversion since browsers cannot decode TIFF natively.",
  alternates: { canonical: "https://www.toolsz.co/tiff-to-png" },
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
