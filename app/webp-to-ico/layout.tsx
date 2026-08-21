import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "WebP to ICO Converter — Free Favicon Creator",
  description: "Convert WebP to ICO favicon online. Creates multi-size .ico file (16, 32, 48, 256px). Free, private, instant — no upload needed.",
  alternates: { canonical: "https://www.toolsz.co/webp-to-ico" },
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
