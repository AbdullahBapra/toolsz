import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "WebP to GIF Converter — Free Online Tool",
  description: "Convert WebP to GIF online. Free, private, instant — no upload needed.",
  alternates: { canonical: "https://www.toolsz.co/webp-to-gif" },
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
