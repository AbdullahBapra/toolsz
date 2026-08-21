import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "TIFF to JPG Converter — Guide & Free Tools",
  description: "Convert TIFF to JPG. Browsers can't decode TIFF natively — learn the best free desktop and online tools for TIFF conversion.",
  alternates: { canonical: "https://www.toolsz.co/tiff-to-jpg" },
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
