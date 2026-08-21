import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "ICO to PNG Converter — Free Online Tool",
  description: "Convert ICO favicon files to PNG images online. Extracts the largest icon size. Free, private, instant.",
  alternates: { canonical: "https://www.toolsz.co/ico-to-png" },
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
