import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "ICO to WebP Converter — Free Online Tool",
  description: "Convert ICO favicon files to WebP format online. Free, private, instant — no upload needed.",
  alternates: { canonical: "https://www.toolsz.co/ico-to-webp" },
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
