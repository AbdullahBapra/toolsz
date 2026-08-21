import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "WebP to JPG Converter — Free Online Tool",
  description: "Convert WebP to JPG online for maximum compatibility. Free, private, instant — no upload needed.",
  alternates: { canonical: "https://www.toolsz.co/webp-to-jpg" },
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
