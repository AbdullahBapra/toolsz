import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "JPG to AVIF Converter — Free Online Tool",
  description: "Convert JPG to AVIF for superior web compression. Smaller than WebP, better quality than JPG. Free, private, instant — Chrome/Firefox required.",
  alternates: { canonical: "https://www.toolsz.co/jpg-to-avif" },
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
