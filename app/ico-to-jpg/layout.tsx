import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "ICO to JPG Converter — Free Online Tool",
  description: "Convert ICO favicon files to JPG images online. Free, private, instant — no upload needed.",
  alternates: { canonical: "https://www.toolsz.co/ico-to-jpg" },
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
