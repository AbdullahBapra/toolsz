import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "AVIF to JPG Converter — Free Online Tool",
  description: "Convert AVIF to JPG for maximum compatibility with older browsers and apps. Free, private, instant — no upload needed.",
  alternates: { canonical: "https://www.toolsz.co/avif-to-jpg" },
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
