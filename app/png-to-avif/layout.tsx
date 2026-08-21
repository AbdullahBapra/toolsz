import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "PNG to AVIF Converter — Free Online Tool",
  description: "Convert PNG to AVIF for next-gen web compression. 50% smaller than PNG at equivalent quality. Free, private, instant — Chrome/Firefox required.",
  alternates: { canonical: "https://www.toolsz.co/png-to-avif" },
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
