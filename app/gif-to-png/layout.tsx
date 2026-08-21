import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "GIF to PNG Converter — Free Online Tool",
  description: "Convert GIF to PNG online. Lossless quality, transparency preserved, instant. No upload needed — works entirely in your browser.",
  alternates: { canonical: "https://www.toolsz.co/gif-to-png" },
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
