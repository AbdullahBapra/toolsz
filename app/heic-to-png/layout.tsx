import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "HEIC to PNG Converter — Free Online Tool",
  description: "Convert iPhone HEIC photos to PNG online. Lossless quality, full transparency support. Free, private, instant — uses our multi-format HEIC converter.",
  alternates: { canonical: "https://www.toolsz.co/heic-to-png" },
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
